import { Package, AlertTriangle, TrendingUp, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStockStatus } from "@/components/ProductFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, useClients, useVendas, type DbProduct } from "@/hooks/useSupabaseData";
import { DateRangeFilter, useDateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

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

function getAlertMessage(product: DbProduct): string {
  if (product.is_acessorio) {
    const name = product.subcategoria_acessorio || product.model;
    const cor = product.color && product.color !== "" && product.color.toLowerCase() !== "nenhuma"
      ? ` ${product.color}`
      : "";
    return `${name}${cor} está com estoque baixo`;
  }
  return `Poucos itens em estoque para: ${product.model}`;
}

interface StockAlert {
  message: string;
  level: "low_stock" | "out_of_stock";
  stock: number;
  minStock: number;
  products: DbProduct[];
}

function buildAlerts(products: DbProduct[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  // Out of stock — always individual
  products
    .filter(p => p.status !== "inativo" && getStockStatus(p.stock, p.min_stock) === "out_of_stock")
    .forEach(p => {
      alerts.push({
        message: p.is_acessorio
          ? `${p.subcategoria_acessorio || p.model}${p.color && p.color.toLowerCase() !== "nenhuma" ? ` ${p.color}` : ""} sem estoque`
          : `${p.model} sem estoque`,
        level: "out_of_stock",
        stock: p.stock,
        minStock: p.min_stock,
        products: [p],
      });
    });

  // Low stock
  const lowStockProducts = products.filter(
    p => p.status !== "inativo" && getStockStatus(p.stock, p.min_stock) === "low_stock"
  );

  // Accessories — individual alerts with color
  lowStockProducts
    .filter(p => p.is_acessorio)
    .forEach(p => {
      alerts.push({
        message: getAlertMessage(p),
        level: "low_stock",
        stock: p.stock,
        minStock: p.min_stock,
        products: [p],
      });
    });

  // Normal products — grouped by category/model
  const normalLow = lowStockProducts.filter(p => !p.is_acessorio);
  const grouped = new Map<string, DbProduct[]>();
  normalLow.forEach(p => {
    const key = p.category || p.model;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  });
  grouped.forEach((prods, key) => {
    alerts.push({
      message: `Poucos itens em estoque para: ${key}`,
      level: "low_stock",
      stock: Math.min(...prods.map(p => p.stock)),
      minStock: Math.max(...prods.map(p => p.min_stock)),
      products: prods,
    });
  });

  return alerts;
}

export default function Dashboard() {
  const { data: products } = useProducts();
  const { data: sales } = useVendas();
  const { data: clients } = useClients();
  const { preset, range, onChange: onDateChange } = useDateRangeFilter();

  const filteredSales = filterByDateRange(sales, range);
  const filteredClients = filterByDateRange(clients, range);

  const salesTotalValue = filteredSales.reduce((acc, s) => acc + Number(s.total), 0);

  const activeProducts = products.filter(p => p.status !== "inativo");
  const alerts = buildAlerts(products);
  const outAlerts = alerts.filter(a => a.level === "out_of_stock");
  const lowAlerts = alerts.filter(a => a.level === "low_stock");
  const totalStock = activeProducts.reduce((acc, p) => acc + p.stock, 0);
  const hasAlerts = alerts.length > 0;

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Dashboard</h1>
            <p className="text-ui text-muted-foreground">Visão geral do sistema</p>
          </div>
          <DateRangeFilter preset={preset} range={range} onChange={onDateChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Vendas no Período" value={`R$ ${salesTotalValue.toFixed(2)}`} subtitle={filteredSales.length > 0 ? `${filteredSales.length} vendas` : "Sem dados no período"} icon={ShoppingCart} />
          <MetricCard title="Ticket Médio" value={filteredSales.length > 0 ? `R$ ${(salesTotalValue / filteredSales.length).toFixed(2)}` : "R$ 0.00"} subtitle={filteredSales.length > 0 ? `${filteredSales.length} vendas` : "Sem dados no período"} icon={TrendingUp} />
          <MetricCard title="Total em Estoque" value={String(totalStock)} subtitle={`${activeProducts.length} produtos`} icon={Package} />
          <MetricCard title="Clientes no Período" value={String(filteredClients.filter(c => c.status === "active").length)} subtitle={filteredClients.length > 0 ? "ativos" : "Sem dados no período"} icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-ui font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alerta de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {hasAlerts && (
                <div className="flex flex-wrap gap-2">
                  {lowAlerts.length > 0 && (
                    <Badge variant="outline" className="text-caption border-warning text-warning gap-1">
                      ⚠ {lowAlerts.length} {lowAlerts.length === 1 ? "alerta" : "alertas"} de estoque baixo
                    </Badge>
                  )}
                  {outAlerts.length > 0 && (
                    <Badge variant="outline" className="text-caption border-destructive text-destructive gap-1">
                      🔴 {outAlerts.length} {outAlerts.length === 1 ? "item" : "itens"} sem estoque
                    </Badge>
                  )}
                </div>
              )}
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {outAlerts.map((alert, i) => (
                  <div key={`out-${i}`} className="flex items-center justify-between py-2 px-3 rounded-md bg-destructive/5">
                    <div>
                      <p className="text-ui font-medium">{alert.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {alert.products.map(p => p.code).join(", ")}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-caption">Sem estoque</Badge>
                  </div>
                ))}
                {lowAlerts.map((alert, i) => (
                  <div key={`low-${i}`} className="flex items-center justify-between py-2 px-3 rounded-md bg-warning/5">
                    <div>
                      <p className="text-ui font-medium">{alert.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {alert.products.map(p => p.code).join(", ")} · mín: {alert.minStock}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-caption tabular-nums border-warning text-warning">
                      {alert.stock} un. ⚠
                    </Badge>
                  </div>
                ))}
                {!hasAlerts && (
                  <p className="text-ui text-muted-foreground py-4 text-center">Todos os produtos com estoque adequado ✓</p>
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
                {filteredSales.slice(0, 10).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="text-ui font-medium">#{sale.number}</p>
                      <p className="text-caption text-muted-foreground">{sale.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ui font-medium tabular-nums text-primary">R$ {Number(sale.total).toFixed(2)}</p>
                      <p className="text-caption text-muted-foreground">{sale.payment_method}</p>
                    </div>
                  </div>
                ))}
                {filteredSales.length === 0 && (
                  <p className="text-ui text-muted-foreground py-4 text-center">Sem vendas no período selecionado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
