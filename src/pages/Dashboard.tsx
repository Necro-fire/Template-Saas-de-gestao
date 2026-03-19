import { useMemo, useState, useEffect, useCallback } from "react";
import { format, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval, startOfDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { DateRangeFilter, useDateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { useProducts, useClients, useVendas, type DbVenda } from "@/hooks/useSupabaseData";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { useCaixas, type DbCaixaMovimentacao } from "@/hooks/useCaixa";

import { MetricCards } from "@/components/dashboard/MetricCards";
import { FinancialFlowChart } from "@/components/dashboard/FinancialFlowChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { SalesStatusChart } from "@/components/dashboard/SalesStatusChart";
import { PaymentMethodsChart } from "@/components/dashboard/PaymentMethodsChart";
import { ClientsChart } from "@/components/dashboard/ClientsChart";
import { SellerRanking } from "@/components/dashboard/SellerRanking";
import { StockOverview } from "@/components/dashboard/StockOverview";
import { CaixaSummary } from "@/components/dashboard/CaixaSummary";
import { RecentSalesList } from "@/components/dashboard/RecentSalesList";
import { RecentMovementsList } from "@/components/dashboard/RecentMovementsList";

function useAllMovimentacoes() {
  const [movs, setMovs] = useState<DbCaixaMovimentacao[]>([]);
  const { selectedFilial } = useFilial();

  const fetchAll = useCallback(async () => {
    // Get caixas for selected filial
    let caixaQuery = (supabase as any).from("caixas").select("id");
    if (selectedFilial !== "all") caixaQuery = caixaQuery.eq("filial_id", selectedFilial);
    const { data: caixas } = await caixaQuery;
    if (!caixas || caixas.length === 0) { setMovs([]); return; }

    const ids = caixas.map((c: any) => c.id);
    const { data } = await (supabase as any)
      .from("caixa_movimentacoes")
      .select("*")
      .in("caixa_id", ids)
      .order("created_at", { ascending: false });
    if (data) setMovs(data);
  }, [selectedFilial]);

  useEffect(() => {
    fetchAll();
    const ch = supabase.channel("all-mov-dash").on("postgres_changes", { event: "*", schema: "public", table: "caixa_movimentacoes" }, () => fetchAll()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  return movs;
}

function useVendaItems(vendaIds: string[]) {
  const [items, setItems] = useState<{ produto_id: string; product_model: string; quantity: number }[]>([]);

  useEffect(() => {
    if (vendaIds.length === 0) { setItems([]); return; }
    (async () => {
      // Fetch in batches if needed (supabase limit)
      const batchSize = 50;
      const allItems: any[] = [];
      for (let i = 0; i < vendaIds.length; i += batchSize) {
        const batch = vendaIds.slice(i, i + batchSize);
        const { data } = await (supabase as any)
          .from("venda_items")
          .select("produto_id, product_model, quantity")
          .in("venda_id", batch);
        if (data) allItems.push(...data);
      }
      setItems(allItems);
    })();
  }, [vendaIds.join(",")]);

  return items;
}

export default function Dashboard() {
  const { data: products } = useProducts();
  const { data: alertConfigs } = useStockAlerts();
  const { data: allSales } = useVendas();
  const { data: allClients } = useClients();
  const { caixas } = useCaixas();
  const allMovs = useAllMovimentacoes();
  const { preset, range, onChange: onDateChange } = useDateRangeFilter();

  const filteredSales = filterByDateRange(allSales, range);
  const filteredClients = filterByDateRange(allClients, range);

  // Previous period for comparison
  const periodMs = range.to.getTime() - range.from.getTime();
  const prevRange = { from: new Date(range.from.getTime() - periodMs), to: new Date(range.from.getTime() - 1) };
  const prevSales = filterByDateRange(allSales, prevRange);

  const completedSales = filteredSales.filter(s => s.status !== "cancelada");
  const cancelledSales = filteredSales.filter(s => s.status === "cancelada");

  const totalRevenue = completedSales.reduce((a, s) => a + Number(s.total), 0);
  const prevRevenue = prevSales.filter(s => s.status !== "cancelada").reduce((a, s) => a + Number(s.total), 0);

  // Expenses from movimentacoes in period
  const filteredMovs = allMovs.filter(m => {
    const t = new Date(m.created_at).getTime();
    return t >= range.from.getTime() && t <= range.to.getTime();
  });
  const totalExpenses = filteredMovs
    .filter(m => m.tipo === "saida" || m.tipo === "sangria")
    .reduce((a, m) => a + Math.abs(m.valor), 0);
  const prevMovs = allMovs.filter(m => {
    const t = new Date(m.created_at).getTime();
    return t >= prevRange.from.getTime() && t <= prevRange.to.getTime();
  });
  const prevExpenses = prevMovs
    .filter(m => m.tipo === "saida" || m.tipo === "sangria")
    .reduce((a, m) => a + Math.abs(m.valor), 0);

  // Daily revenue sparkline
  const dailyRevenue = useMemo(() => {
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    return days.map(d => {
      const dayStart = startOfDay(d).getTime();
      const dayEnd = dayStart + 86400000;
      return completedSales
        .filter(s => { const t = new Date(s.created_at).getTime(); return t >= dayStart && t < dayEnd; })
        .reduce((a, s) => a + Number(s.total), 0);
    });
  }, [completedSales, range]);

  // Financial flow chart data (monthly or daily based on period)
  const flowData = useMemo(() => {
    const isLongPeriod = periodMs > 35 * 86400000;
    if (isLongPeriod) {
      const months = eachMonthOfInterval({ start: range.from, end: range.to });
      return months.map(m => {
        const ms = startOfMonth(m).getTime();
        const me = startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1)).getTime();
        const receitas = completedSales.filter(s => { const t = new Date(s.created_at).getTime(); return t >= ms && t < me; }).reduce((a, s) => a + Number(s.total), 0);
        const despesas = filteredMovs.filter(mv => { const t = new Date(mv.created_at).getTime(); return t >= ms && t < me && (mv.tipo === "saida" || mv.tipo === "sangria"); }).reduce((a, mv) => a + Math.abs(mv.valor), 0);
        return { label: format(m, "MMM", { locale: ptBR }), receitas, despesas };
      });
    }
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    return days.map(d => {
      const ds = startOfDay(d).getTime();
      const de = ds + 86400000;
      const receitas = completedSales.filter(s => { const t = new Date(s.created_at).getTime(); return t >= ds && t < de; }).reduce((a, s) => a + Number(s.total), 0);
      const despesas = filteredMovs.filter(mv => { const t = new Date(mv.created_at).getTime(); return t >= ds && t < de && (mv.tipo === "saida" || mv.tipo === "sangria"); }).reduce((a, mv) => a + Math.abs(mv.valor), 0);
      return { label: format(d, "dd/MM", { locale: ptBR }), receitas, despesas };
    });
  }, [completedSales, filteredMovs, range, periodMs]);

  // Top products
  const vendaIds = useMemo(() => completedSales.map(s => s.id), [completedSales]);
  const vendaItems = useVendaItems(vendaIds);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    vendaItems.forEach(i => {
      map.set(i.product_model, (map.get(i.product_model) || 0) + i.quantity);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, qty }));
  }, [vendaItems]);

  // Payment methods
  const paymentData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    completedSales.forEach(s => {
      const key = s.payment_method || "Outro";
      const curr = map.get(key) || { total: 0, count: 0 };
      map.set(key, { total: curr.total + Number(s.total), count: curr.count + 1 });
    });
    return [...map.entries()].map(([method, d]) => ({ method, ...d })).sort((a, b) => b.total - a.total);
  }, [completedSales]);

  // Clients by month
  const clientsData = useMemo(() => {
    const isLong = periodMs > 35 * 86400000;
    if (isLong) {
      const months = eachMonthOfInterval({ start: range.from, end: range.to });
      return months.map(m => {
        const ms = startOfMonth(m).getTime();
        const me = startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1)).getTime();
        const novos = filteredClients.filter(c => { const t = new Date(c.created_at).getTime(); return t >= ms && t < me; }).length;
        return { label: format(m, "MMM", { locale: ptBR }), novos };
      });
    }
    // Weekly buckets for shorter periods
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    const weekSize = Math.max(Math.ceil(days.length / 7), 1);
    const buckets: { label: string; novos: number }[] = [];
    for (let i = 0; i < days.length; i += weekSize) {
      const slice = days.slice(i, i + weekSize);
      const ds = startOfDay(slice[0]).getTime();
      const de = startOfDay(slice[slice.length - 1]).getTime() + 86400000;
      const novos = filteredClients.filter(c => { const t = new Date(c.created_at).getTime(); return t >= ds && t < de; }).length;
      buckets.push({ label: format(slice[0], "dd/MM", { locale: ptBR }), novos });
    }
    return buckets;
  }, [filteredClients, range, periodMs]);

  // Seller ranking
  const sellerData = useMemo(() => {
    const map = new Map<string, { sales: number; revenue: number }>();
    completedSales.forEach(s => {
      const name = s.seller_name || "Sem vendedor";
      const curr = map.get(name) || { sales: 0, revenue: 0 };
      map.set(name, { sales: curr.sales + 1, revenue: curr.revenue + Number(s.total) });
    });
    return [...map.entries()]
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [completedSales]);

  // Caixa movs for summary (only from open caixa or latest)
  const caixaAberto = caixas.find(c => c.status === "aberto");
  const caixaMovs = useMemo(() => {
    if (!caixaAberto) return [];
    return allMovs.filter(m => m.caixa_id === caixaAberto.id);
  }, [caixaAberto, allMovs]);

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Dashboard</h1>
            <p className="text-ui text-muted-foreground">Visão geral completa do sistema</p>
          </div>
          <DateRangeFilter preset={preset} range={range} onChange={onDateChange} />
        </div>

        {/* 1. Metric Cards */}
        <MetricCards
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          totalSales={completedSales.length}
          prevRevenue={prevRevenue}
          prevExpenses={prevExpenses}
          prevSales={prevSales.filter(s => s.status !== "cancelada").length}
          dailyRevenue={dailyRevenue}
        />

        {/* 2. Financial Flow */}
        <FinancialFlowChart data={flowData} />

        {/* 3 + 4. Products + Sales Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsChart data={topProducts} />
          <SalesStatusChart concluidas={completedSales.length} canceladas={cancelledSales.length} />
        </div>

        {/* 5 + 6. Payment + Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PaymentMethodsChart data={paymentData} />
          <ClientsChart data={clientsData} />
        </div>

        {/* 7 + 8. Seller Ranking + Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SellerRanking sellers={sellerData} />
          <StockOverview products={products} alertConfigs={alertConfigs} />
        </div>

        {/* 9. Caixa */}
        <CaixaSummary caixas={caixas} movimentacoes={caixaMovs} />

        {/* 10. Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentSalesList sales={filteredSales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} />
          <RecentMovementsList movimentacoes={filteredMovs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} />
        </div>
      </div>
    </div>
  );
}
