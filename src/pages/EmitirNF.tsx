import { useState, useMemo } from "react";
import { FileText, AlertTriangle, CheckCircle2, Send, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FilialSelector } from "@/components/FilialSelector";
import { useFilial } from "@/contexts/FilialContext";
import { useVendas } from "@/hooks/useSupabaseData";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { toast } from "sonner";

export default function EmitirNF() {
  const { selectedFilial, setSelectedFilial, getEmpresaByFilial, filiais } = useFilial();
  const { data: allSales } = useVendas();
  const { create: createNF } = useNotasFiscais();
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [emitting, setEmitting] = useState(false);

  // Force filial selection (no "all")
  const activeFilial = selectedFilial === "all" ? (filiais[0]?.id || "1") : selectedFilial;
  const empresa = getEmpresaByFilial(activeFilial);

  // Only show completed sales from selected filial that haven't been invoiced yet
  const availableSales = useMemo(() => 
    allSales.filter(s => s.status === "concluida" && s.filial_id === activeFilial),
    [allSales, activeFilial]
  );

  const sale = availableSales.find(s => s.id === selectedSaleId);

  const validations = sale ? [
    { label: "Empresa/Filial configurada", ok: !!empresa },
    { label: "CNPJ da empresa", ok: !!empresa?.cnpj },
    { label: "Endereço da empresa", ok: !!(empresa?.endereco && empresa?.cidade && empresa?.estado) },
    { label: "Inscrição Estadual", ok: !!empresa?.inscricao_estadual },
    { label: "Regime Tributário", ok: !!empresa?.regime_tributario },
  ] : [];

  const allValid = validations.every(v => v.ok);

  const handleEmit = async () => {
    if (!sale || !empresa || !allValid) {
      toast.error("Corrija as pendências antes de emitir");
      return;
    }
    setEmitting(true);
    try {
      await createNF({
        numero: sale.number,
        filial_id: activeFilial,
        venda_id: sale.id,
        empresa_id: empresa.id,
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
      <FilialSelector hideAll />
      <div className="p-4 space-y-4 max-w-3xl">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Emitir NF-e</h1>
          <p className="text-ui text-muted-foreground">Selecione uma venda para gerar a nota fiscal</p>
        </div>

        {/* Empresa info card */}
        {empresa ? (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-ui font-medium">{empresa.nome_fantasia || empresa.razao_social}</p>
                  <p className="text-caption text-muted-foreground">
                    CNPJ: {empresa.cnpj} · {empresa.cidade}/{empresa.estado}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto text-caption">
                  {empresa.ambiente === "producao" ? "Produção" : "Homologação"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-warning/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-warning">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-ui font-medium">Nenhuma empresa configurada para esta filial</p>
                  <p className="text-caption text-muted-foreground">
                    Cadastre a empresa em Empresas (Filiais) antes de emitir NF
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-ui">Validações da Filial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validations.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-ui">
                    {v.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className={v.ok ? "text-foreground" : "text-warning"}>{v.label}</span>
                    {!v.ok && <Badge variant="secondary" className="text-caption ml-auto">Pendente</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full h-10" onClick={handleEmit} disabled={!allValid || emitting}>
              <Send className="h-4 w-4 mr-2" />
              {emitting ? "Emitindo..." : "Emitir NF-e"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
