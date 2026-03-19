import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DbVenda } from "@/hooks/useSupabaseData";

interface Props {
  sales: DbVenda[];
}

export function RecentSalesList({ sales }: Props) {
  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold">Últimas Vendas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-1 max-h-[280px] overflow-y-auto">
          {sales.slice(0, 10).map(sale => {
            const isCancelled = sale.status === "cancelada";
            return (
              <div key={sale.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded flex items-center justify-center ${isCancelled ? "bg-destructive/10" : "bg-primary/10"}`}>
                    {isCancelled ? <Ban className="h-3.5 w-3.5 text-destructive" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div>
                    <p className={`text-caption font-medium ${isCancelled ? "line-through" : ""}`}>#{sale.number}</p>
                    <p className="text-caption text-muted-foreground">{sale.client_name || "Avulso"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-caption font-medium tabular-nums ${isCancelled ? "line-through text-muted-foreground" : "text-primary"}`}>
                    R$ {Number(sale.total).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    {isCancelled && <Badge variant="destructive" className="text-[9px] h-3.5 px-1">Canc.</Badge>}
                    <span className="text-[10px] text-muted-foreground">{format(new Date(sale.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {sales.length === 0 && (
            <p className="text-ui text-muted-foreground text-center py-4">Sem vendas no período</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
