import { Package, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { DbProduct } from "@/hooks/useSupabaseData";
import type { AlertaEstoque } from "@/hooks/useStockAlerts";

interface Props {
  products: DbProduct[];
  alertConfigs: AlertaEstoque[];
}

export function StockOverview({ products, alertConfigs }: Props) {
  const navigate = useNavigate();
  const active = products.filter(p => p.status !== "inativo");
  const totalStock = active.reduce((s, p) => s + p.stock, 0);
  const outOfStock = active.filter(p => p.stock === 0).length;
  const lowStock = active.filter(p => p.stock > 0 && p.stock <= p.min_stock).length;

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Controle de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-md bg-secondary/50">
            <p className="text-title font-semibold tabular-nums">{totalStock}</p>
            <p className="text-caption text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-md bg-destructive/5">
            <p className="text-title font-semibold tabular-nums text-destructive">{outOfStock}</p>
            <p className="text-caption text-muted-foreground">Esgotados</p>
          </div>
          <div className="text-center p-2 rounded-md bg-warning/5">
            <p className="text-title font-semibold tabular-nums text-warning">{lowStock}</p>
            <p className="text-caption text-muted-foreground">Baixo</p>
          </div>
        </div>
        <div className="space-y-1 max-h-[180px] overflow-y-auto">
          {active.filter(p => p.stock === 0).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-destructive/5 cursor-pointer hover:ring-1 hover:ring-primary/30" onClick={() => navigate("/estoque")}>
              <span className="text-caption truncate">{p.model}</span>
              <Badge variant="destructive" className="text-[10px]">Esgotado</Badge>
            </div>
          ))}
          {active.filter(p => p.stock > 0 && p.stock <= p.min_stock).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-warning/5 cursor-pointer hover:ring-1 hover:ring-primary/30" onClick={() => navigate("/estoque")}>
              <span className="text-caption truncate">{p.model}</span>
              <Badge variant="outline" className="text-[10px] border-warning text-warning">{p.stock} un.</Badge>
            </div>
          ))}
          {outOfStock === 0 && lowStock === 0 && (
            <p className="text-caption text-muted-foreground text-center py-2">Estoque adequado ✓</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
