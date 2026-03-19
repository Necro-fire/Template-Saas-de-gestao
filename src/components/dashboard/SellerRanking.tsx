import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SellerData {
  name: string;
  sales: number;
  revenue: number;
}

interface Props {
  sellers: SellerData[];
}

export function SellerRanking({ sellers }: Props) {
  const maxRevenue = sellers.length > 0 ? sellers[0].revenue : 1;

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold">Ranking de Vendedores</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 max-h-[260px] overflow-y-auto">
          {sellers.length > 0 ? sellers.map((s, i) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-semibold text-muted-foreground w-5">{i + 1}º</span>
                  <span className="text-ui font-medium truncate">{s.name || "Sem nome"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-caption tabular-nums">{s.sales} vendas</Badge>
                  <span className="text-ui font-semibold tabular-nums text-primary">R$ {s.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(s.revenue / maxRevenue) * 100}%` }} />
              </div>
            </div>
          )) : (
            <p className="text-ui text-muted-foreground text-center py-4">Sem dados no período</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
