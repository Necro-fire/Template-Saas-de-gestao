import { useState } from "react";
import { FileText, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockSales, mockClients } from "@/data/mockData";
import { toast } from "sonner";

export default function EmitirNF() {
  const [selectedSaleId, setSelectedSaleId] = useState("");

  const sale = mockSales.find(s => s.id === selectedSaleId);
  const client = sale ? mockClients.find(c => c.storeName === sale.clientName) : null;

  const validations = sale ? [
    { label: "Cliente com CNPJ", ok: !!client?.cnpj },
    { label: "NCM nos produtos", ok: true },
    { label: "CFOP definido", ok: true },
    { label: "Certificado digital", ok: false },
  ] : [];

  const allValid = validations.every(v => v.ok);

  const handleEmit = () => {
    if (!allValid) {
      toast.error("Corrija as pendências antes de emitir");
      return;
    }
    toast.success("NF-e enviada para SEFAZ com sucesso!");
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-title font-semibold tracking-tighter">Emitir NF-e</h1>
        <p className="text-ui text-muted-foreground">Selecione uma venda para gerar a nota fiscal</p>
      </div>

      <Select value={selectedSaleId} onValueChange={setSelectedSaleId}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecionar venda..." />
        </SelectTrigger>
        <SelectContent>
          {mockSales.map(s => (
            <SelectItem key={s.id} value={s.id}>Venda #{s.number} — {s.clientName} — R$ {s.total.toFixed(2)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sale && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-ui">Dados da Venda #{sale.number}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-ui">
                <div><span className="text-muted-foreground">Cliente:</span> {sale.clientName}</div>
                <div><span className="text-muted-foreground">CNPJ:</span> {client?.cnpj || "—"}</div>
                <div><span className="text-muted-foreground">Data:</span> {sale.date}</div>
                <div><span className="text-muted-foreground">Pagamento:</span> {sale.paymentMethod}</div>
              </div>
              <Separator />
              <div className="space-y-1">
                {sale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-ui">
                    <span>{item.productModel} ({item.productCode}) x{item.quantity}</span>
                    <span className="tabular-nums font-medium">R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-subhead font-semibold">
                <span>Total</span>
                <span className="text-primary tabular-nums">R$ {sale.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-ui">Validações</CardTitle>
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

          <Button className="w-full h-10" onClick={handleEmit} disabled={!allValid}>
            <Send className="h-4 w-4 mr-2" />
            Emitir NF-e
          </Button>
        </>
      )}
    </div>
  );
}
