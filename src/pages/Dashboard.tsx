import { Package, AlertTriangle, TrendingUp, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getStockLevel, getCategoryMin, type StockLevel } from "@/components/ProductFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, useClients, useVendas, type DbProduct } from "@/hooks/useSupabaseData";
import { useProductTypes, type TipoProduto } from "@/hooks/useProductTypes";
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

interface StockAlert {
  message: string;
  level: StockLevel;
  stock: number;
  categoryMin: number;
  products: DbProduct[];
  tipoId: string | null;
}

function buildAlerts(products: DbProduct[], tipos: TipoProduto[]): StockAlert[] {
  const alerts: StockAlert[] = [];
  const active = products.filter(p => p.status !== "inativo");

  // --- Out of stock (individual for all) ---
  active
    .filter(p => getStockLevel(p.stock, getCategoryMin(p, tipos)) === "out_of_stock")
    .forEach(p => {
      const name = p.is_acessorio
        ? `${p.subcategoria_acessorio || p.model}${p.color && p.color.toLowerCase() !== "nenhuma" ? ` ${p.color}` : ""}`
        : p.model;
      alerts.push({
        message: `${name} sem estoque`,
        level: "out_of_stock",
        stock: 0,
        categoryMin: getCategoryMin(p, tipos),
        products: [p],
        tipoId: p.tipo_produto_id,
      });
    });

  // --- Critical & Low ---
  const nonNormal = active.filter(p => {
    const l = getStockLevel(p.stock, getCategoryMin(p, tipos));
    return l === "critical" || l === "low";
  });

  // Accessories — individual
  nonNormal.filter(p => p.is_acessorio).forEach(p => {
    const level = getStockLevel(p.stock, getCategoryMin(p, tipos));
    const name = p.subcategoria_acessorio || p.model;
    const cor = p.color && p.color.toLowerCase() !== "nenhuma" ? ` ${p.color}` : "";
    const label = level === "critical" ? "em estado crítico" : "está com estoque baixo";
    alerts.push({
      message: `${name}${cor} ${label}`,
      level,
      stock: p.stock,
      categoryMin: getCategoryMin(p, tipos),
      products: [p],
      tipoId: p.tipo_produto_id,
    });
  });

  // Normal products — grouped by tipo_produto (category)
  const normalAlerts = nonNormal.filter(p => !p.is_acessorio);
  const grouped = new Map<string, { level: StockLevel; products: DbProduct[]; catMin: number; tipoId: string | null }>();
  normalAlerts.forEach(p => {
    const catMin = getCategoryMin(p, tipos);
    const level = getStockLevel(p.stock, catMin);
    const tipo = tipos.find(t => t.id === p.tipo_produto_id);
    const key = tipo?.nome_tipo || p.category || p.model;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { level, products: [p], catMin, tipoId: p.tipo_produto_id });
    } else {
      existing.products.push(p);
      // Use worst level
      if (level === "critical" && existing.level === "low") existing.level = "critical";
    }
  });
  grouped.forEach((data, key) => {
    const label = data.level === "critical" ? `Estoque crítico em ${key}` : `Poucos itens em estoque para: ${key}`;
    alerts.push({
      message: label,
      level: data.level,
      stock: Math.min(...data.products.map(p => p.stock)),
      categoryMin: data.catMin,
      products: data.products,
      tipoId: data.tipoId,
    });
  });

  // Sort: out_of_stock first, then critical, then low
  const order: Record<StockLevel, number> = { out_of_stock: 0, critical: 1, low: 2, normal: 3 };
  alerts.sort((a, b) => order[a.level] - order[b.level]);

  return alerts;
}

function alertBadge(level: StockLevel, stock: number) {
  switch (level) {
    case "out_of_stock":
      return <Badge variant="destructive" className="text-caption">Esgotado</Badge>;
    case "critical":
      return <Badge className="text-caption bg-orange-600 text-white hover:bg-orange-700">Crítico</Badge>;
    case "low":
      return <Badge variant="outline" className="text-caption tabular-nums border-warning text-warning">{stock} un. ⚠</Badge>;
    default:
      return null;
  }
}

function alertBgClass(level: StockLevel) {
  switch (level) {
    case "out_of_stock": return "bg-destructive/5";
    case "critical": return "bg-orange-500/5";
    case "low": return "bg-warning/5";
    default: return "";
  }
}

export default function Dashboard() {
  const { data: products } = useProducts();
  const { data: tipos } = useProductTypes();
  const { data: sales } = useVendas();
  const { data: clients } = useClients();
  const { preset, range, onChange: onDateChange } = useDateRangeFilter();

  const filteredSales = filterByDateRange(sales, range);
  const filteredClients = filterByDateRange(clients, range);

  const salesTotalValue = filteredSales.reduce((acc, s) => acc + Number(s.total), 0);

  const activeProducts = products.filter(p => p.status !== "inativo");
  const alerts = buildAlerts(products, tipos);
  const outAlerts = alerts.filter(a => a.level === "out_of_stock");
  const critAlerts = alerts.filter(a => a.level === "critical");
  const lowAlerts = alerts.filter(a => a.level === "low");
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
                  {outAlerts.length > 0 && (
                    <Badge variant="outline" className="text-caption border-destructive text-destructive gap-1">
                      🔴 {outAlerts.length} esgotado{outAlerts.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {critAlerts.length > 0 && (
                    <Badge variant="outline" className="text-caption border-orange-500 text-orange-600 gap-1">
                      🟠 {critAlerts.length} crítico{critAlerts.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {lowAlerts.length > 0 && (
                    <Badge variant="outline" className="text-caption border-warning text-warning gap-1">
                      ⚠ {lowAlerts.length} baixo{lowAlerts.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {alerts.map((alert, i) => (
                  <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-md ${alertBgClass(alert.level)}`}>
                    <div>
                      <p className="text-ui font-medium">{alert.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {alert.products.length <= 3
                          ? alert.products.map(p => p.code).join(", ")
                          : `${alert.products.slice(0, 3).map(p => p.code).join(", ")} +${alert.products.length - 3}`}
                        {" · mín: "}{alert.categoryMin}
                      </p>
                    </div>
                    {alertBadge(alert.level, alert.stock)}
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
