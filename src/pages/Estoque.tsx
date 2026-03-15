import { Package, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProducts } from "@/data/mockData";

export default function Estoque() {
  const totalStock = mockProducts.reduce((acc, p) => acc + p.stock, 0);
  const lowStock = mockProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStock = mockProducts.filter(p => p.stock === 0).length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-title font-semibold tracking-tighter">Estoque</h1>
        <p className="text-ui text-muted-foreground">Controle de estoque geral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Total em Estoque</p>
              <p className="text-title font-semibold tabular-nums">{totalStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-warning/10 flex items-center justify-center">
              <ArrowDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Estoque Baixo</p>
              <p className="text-title font-semibold tabular-nums">{lowStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-destructive/10 flex items-center justify-center">
              <ArrowDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Sem Estoque</p>
              <p className="text-title font-semibold tabular-nums">{outOfStock}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-ui font-semibold">Inventário</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            {mockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-caption text-muted-foreground font-mono w-16">{p.code}</span>
                  <div>
                    <p className="text-ui font-medium">{p.model}</p>
                    <p className="text-caption text-muted-foreground">{p.color} · {p.material}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={p.stock === 0 ? "destructive" : p.stock <= p.minStock ? "outline" : "secondary"}
                    className="tabular-nums text-caption"
                  >
                    {p.stock} un.
                  </Badge>
                  <span className="text-caption text-muted-foreground tabular-nums">mín: {p.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
