import { Package, AlertTriangle, TrendingUp, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProducts, mockSales, mockClients } from "@/data/mockData";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

function MetricCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; trend?: "up" | "down";
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-muted-foreground">{title}</p>
            <p className="text-title font-semibold tracking-tighter tabular-nums mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend === "up" && <ArrowUpRight className="h-3 w-3 text-success" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3 text-destructive" />}
              <p className="text-caption text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { filterByFilial } = useFilial();

  const products = filterByFilial(mockProducts);
  const sales = filterByFilial(mockSales);
  const clients = filterByFilial(mockClients);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const todaySalesTotal = sales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Dashboard</h1>
          <p className="text-ui text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Vendas Hoje" value={`R$ ${todaySalesTotal.toFixed(2)}`} subtitle="+12% vs ontem" icon={ShoppingCart} trend="up" />
          <MetricCard title="Vendas Mês" value="R$ 12.450,00" subtitle="+8% vs mês anterior" icon={TrendingUp} trend="up" />
          <MetricCard title="Total em Estoque" value={String(totalStock)} subtitle={`${products.length} produtos`} icon={Package} />
          <MetricCard title="Clientes Ativos" value={String(clients.length)} subtitle="ativos" icon={Users} trend="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-ui font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alertas de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-1">
                {outOfStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-destructive/5">
                    <div>
                      <p className="text-ui font-medium">{p.model}</p>
                      <p className="text-caption text-muted-foreground">{p.code} · {p.color}</p>
                    </div>
                    <span className="text-caption font-medium text-destructive">Sem estoque</span>
                  </div>
                ))}
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-warning/5">
                    <div>
                      <p className="text-ui font-medium">{p.model}</p>
                      <p className="text-caption text-muted-foreground">{p.code} · {p.color}</p>
                    </div>
                    <span className="text-caption font-medium text-warning tabular-nums">{p.stock} un.</span>
                  </div>
                ))}
                {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                  <p className="text-ui text-muted-foreground py-4 text-center">Nenhum alerta</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-ui font-semibold">Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-1">
                {sales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="text-ui font-medium">#{sale.number}</p>
                      <p className="text-caption text-muted-foreground">{sale.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ui font-medium tabular-nums text-primary">R$ {sale.total.toFixed(2)}</p>
                      <p className="text-caption text-muted-foreground">{sale.paymentMethod}</p>
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-ui text-muted-foreground py-4 text-center">Nenhuma venda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-ui font-semibold">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-secondary/30">
                  <span className="text-title font-bold text-muted-foreground/30 tabular-nums">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-ui font-medium truncate">{p.model}</p>
                    <p className="text-caption text-muted-foreground">{p.code} · {p.stock} un.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
