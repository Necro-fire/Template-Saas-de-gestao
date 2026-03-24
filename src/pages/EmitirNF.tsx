import { useState, useMemo } from "react";
import { FileText, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FilialSelector } from "@/components/FilialSelector";
import { useFilial } from "@/contexts/FilialContext";
import { useVendas } from "@/hooks/useSupabaseData";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { useEmpresas } from "@/hooks/useEmpresas";
import { toast } from "sonner";

export default function EmitirNF() {
  const { selectedFilial, filiais } = useFilial();
  const { data: allSales } = useVendas();
  const { create: createNF } = useNotasFiscais();
  const { data: empresas } = useEmpresas();
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [emitting, setEmitting] = useState(false);

  const isAllFiliais = selectedFilial === "all";

  // Find the empresa record for the selected filial
  const empresaFilial = useMemo(() => {
    if (isAllFiliais) return null;
    return empresas.find(e => e.filial_id === selectedFilial && e.ativa);
  }, [empresas, selectedFilial, isAllFiliais]);

  // Validate empresa has minimum required data
  const empresaIncompleta = useMemo(() => {
    if (!empresaFilial) return true;
    const required = [
      empresaFilial.razao_social,
      empresaFilial.cnpj,
      empresaFilial.endereco,
      empresaFilial.cidade,
      empresaFilial.estado,
      empresaFilial.cep,
    ];
    return required.some(v => !v || v.trim() === "");
  }, [empresaFilial]);

  const availableSales = useMemo(() => {
    if (isAllFiliais) return [];
    return allSales.filter(s => s.status === "concluida" && s.filial_id === selectedFilial);
  }, [allSales, selectedFilial, isAllFiliais]);

  const sale = availableSales.find(s => s.id === selectedSaleId);

  const handleEmit = async () => {
    if (isAllFiliais) {
      toast.error("Selecione uma filial específica para emitir a nota");
      return;
    }
    if (!empresaFilial || empresaIncompleta) {
      toast.error("A filial selecionada não possui dados cadastrais completos");
      return;
    }
    if (!sale) {
      toast.error("Selecione uma venda");
      return;
    }
    setEmitting(true);
    try {
      await createNF({
        numero: sale.number,
        filial_id: selectedFilial,
        venda_id: sale.id,
        empresa_id: empresaFilial.id,
        client_name: sale.client_name,
        client_cnpj: "",
        valor_total: Number(sale.total),
        status: "pendente",
        chave_acesso: "",
        data_emissao: new Date().toISOString(),
      });
      toast.success("NF-e registrada com sucesso!");
      setSelectedSaleId("");
    } catch (err: any) {
      toast.error("Erro ao emitir: " + (err.message || "Erro desconhecido"));
    } finally {
      setEmitting(false);
    }
  };

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4 max-w-3xl">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Emitir NF-e</h1>
          <p className="text-ui text-muted-foreground">Selecione uma venda para gerar a nota fiscal</p>
        </div>

        {isAllFiliais && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Selecione uma filial específica para emitir a nota.
            </AlertDescription>
          </Alert>
        )}

        {!isAllFiliais && !empresaFilial && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma empresa cadastrada para esta filial. Cadastre os dados em Empresas antes de emitir.
            </AlertDescription>
          </Alert>
        )}

        {!isAllFiliais && empresaFilial && empresaIncompleta && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A empresa da filial selecionada possui dados incompletos (razão social, CNPJ, endereço, cidade, estado ou CEP). Complete o cadastro em Empresas.
            </AlertDescription>
          </Alert>
        )}

        {!isAllFiliais && empresaFilial && !empresaIncompleta && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-ui">Emitente — {empresaFilial.razao_social}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-ui">
                  <div><span className="text-muted-foreground">CNPJ:</span> {empresaFilial.cnpj}</div>
                  <div><span className="text-muted-foreground">IE:</span> {empresaFilial.inscricao_estadual || "—"}</div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Endereço:</span>{" "}
                    {empresaFilial.endereco}, {empresaFilial.numero} — {empresaFilial.bairro}, {empresaFilial.cidade}/{empresaFilial.estado}
                  </div>
                </div>
              </CardContent>
            </Card>

            {availableSales.length > 0 ? (
              <Select value={selectedSaleId} onValueChange={setSelectedSaleId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar venda..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSales.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      Venda #{s.number} — {s.client_name} — R$ {Number(s.total).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-ui font-medium">Nenhuma venda disponível</p>
                <p className="text-caption mt-1">Vendas concluídas da filial selecionada aparecerão aqui</p>
              </div>
            )}

            {sale && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-ui">Dados da Venda #{sale.number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-ui">
                      <div><span className="text-muted-foreground">Cliente:</span> {sale.client_name}</div>
                      <div><span className="text-muted-foreground">Data:</span> {new Date(sale.created_at).toLocaleDateString("pt-BR")}</div>
                      <div><span className="text-muted-foreground">Pagamento:</span> {sale.payment_method}</div>
                      <div><span className="text-muted-foreground">Total:</span> R$ {Number(sale.total).toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full h-10" onClick={handleEmit} disabled={emitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {emitting ? "Emitindo..." : "Emitir NF-e"}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
