import { useState, useMemo } from "react";
import { FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilialSelector } from "@/components/FilialSelector";
import { useFilial } from "@/contexts/FilialContext";
import { useVendas } from "@/hooks/useSupabaseData";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { toast } from "sonner";

export default function EmitirNF() {
  const { selectedFilial, filiais } = useFilial();
  const { data: allSales } = useVendas();
  const { create: createNF } = useNotasFiscais();
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [emitting, setEmitting] = useState(false);

  const activeFilial = selectedFilial === "all" ? (filiais[0]?.id || "1") : selectedFilial;

  const availableSales = useMemo(() =>
    allSales.filter(s => s.status === "concluida" && s.filial_id === activeFilial),
    [allSales, activeFilial]
  );

  const sale = availableSales.find(s => s.id === selectedSaleId);

  const handleEmit = async () => {
    if (!sale) {
      toast.error("Selecione uma venda");
      return;
    }
    setEmitting(true);
    try {
      await createNF({
        numero: sale.number,
        filial_id: activeFilial,
        venda_id: sale.id,
        empresa_id: null,
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
      </div>
    </div>
  );
}
