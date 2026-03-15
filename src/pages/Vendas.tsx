import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockSales } from "@/data/mockData";

export default function Vendas() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-title font-semibold tracking-tighter">Vendas</h1>
        <p className="text-ui text-muted-foreground">Histórico de vendas</p>
      </div>

      <div className="space-y-1">
        {mockSales.map(sale => (
          <div key={sale.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-ui font-medium">Venda #{sale.number}</p>
                <p className="text-caption text-muted-foreground">{sale.clientName} · {sale.sellerName}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <Badge variant="secondary" className="text-caption">{sale.origin === "bag" ? "Mala" : "Estoque"}</Badge>
              <div>
                <p className="text-ui font-medium tabular-nums text-primary">R$ {sale.total.toFixed(2)}</p>
                <p className="text-caption text-muted-foreground">{sale.paymentMethod} · {sale.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
