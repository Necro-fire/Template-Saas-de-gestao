import { Package, ShoppingCart, TrendingUp, Users, DollarSign } from "lucide-react";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, useClients, useVendas, useVendaItems } from "@/hooks/useSupabaseData";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { useFilial } from "@/contexts/FilialContext";
import { DateRangeFilter, useDateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StockAlertCard, buildConfigAlerts } from "@/components/dashboard/StockAlertCard";
import { RecentSalesCard } from "@/components/dashboard/RecentSalesCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { PaymentDonutChart } from "@/components/dashboard/PaymentDonutChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const { data: products, loading: loadingProducts } = useProducts();
  const { data: alertConfigs } = useStockAlerts();
  const { selectedFilial, filiais } = useFilial();
  const { data: sales, loading: loadingSales } = useVendas();
  const { data: vendaItems } = useVendaItems();
  const { data: clients } = useClients();
  const { preset, range, onChange: onDateChange } = useDateRangeFilter();

  const isLoading = loadingProducts || loadingSales;

  const filteredSales = filterByDateRange(sales, range);
  const filteredClients = filterByDateRange(clients, range);

  const activeSales = filteredSales.filter(s => s.status !== "cancelada");
  const salesTotalValue = activeSales.reduce((acc, s) => acc + Number(s.total), 0);

  const activeProducts = products.filter(p => p.status !== "inativo");
  const alerts = buildConfigAlerts(products, alertConfigs, selectedFilial, filiais);
  const totalStock = activeProducts.reduce((acc, p) => acc + p.stock, 0);

  if (isLoading) {
    return (
      <div>
        <FilialSelector />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Dashboard</h1>
            <p className="text-ui text-muted-foreground">Visão geral do sistema</p>
          </div>
          <DateRangeFilter preset={preset} range={range} onChange={onDateChange} />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vendas no Período"
            value={`R$ ${salesTotalValue.toFixed(2)}`}
            subtitle={activeSales.length > 0 ? `${activeSales.length} vendas` : "Sem dados no período"}
            icon={ShoppingCart}
            accentColor="primary"
          />
          <MetricCard
            title="Ticket Médio"
            value={activeSales.length > 0 ? `R$ ${(salesTotalValue / activeSales.length).toFixed(2)}` : "R$ 0.00"}
            subtitle={activeSales.length > 0 ? `${activeSales.length} vendas` : "Sem dados no período"}
            icon={TrendingUp}
            accentColor="success"
          />
          <MetricCard
            title="Total em Estoque"
            value={String(totalStock)}
            subtitle={`${activeProducts.length} produtos`}
            icon={Package}
            accentColor="warning"
          />
          <MetricCard
            title="Clientes no Período"
            value={String(filteredClients.filter(c => c.status === "active").length)}
            subtitle={filteredClients.length > 0 ? "ativos" : "Sem dados no período"}
            icon={Users}
            accentColor="primary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SalesChart sales={filteredSales} range={range} />
          </div>
          <PaymentDonutChart sales={filteredSales} />
        </div>

        {/* Alerts + Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StockAlertCard alerts={alerts} alertConfigsCount={alertConfigs.length} />
          <RecentSalesCard sales={filteredSales} />
        </div>
      </div>
    </div>
  );
}
