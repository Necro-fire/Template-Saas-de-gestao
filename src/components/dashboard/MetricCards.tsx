import { DollarSign, TrendingDown, TrendingUp, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: { value: number; direction: "up" | "down" };
  sparkData?: number[];
  color?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, sparkData, color = "hsl(var(--primary))" }: MetricCardProps) {
  const chartData = sparkData?.map((v, i) => ({ v, i })) || [];

  return (
    <Card className="shadow-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-caption text-muted-foreground truncate">{title}</p>
            </div>
            <p className="text-title font-semibold tracking-tighter tabular-nums mt-2">{value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {trend && (
                <span className={`flex items-center gap-0.5 text-caption font-medium ${trend.direction === "up" ? "text-success" : "text-destructive"}`}>
                  {trend.direction === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {trend.value.toFixed(1)}%
                </span>
              )}
              <p className="text-caption text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {chartData.length > 1 && (
            <div className="w-20 h-10 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${title})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  totalSales: number;
  prevRevenue: number;
  prevExpenses: number;
  prevSales: number;
  dailyRevenue: number[];
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? { value: 100, direction: "up" as const } : undefined;
  const pct = ((curr - prev) / prev) * 100;
  return { value: Math.abs(pct), direction: pct >= 0 ? "up" as const : "down" as const };
}

export function MetricCards({ totalRevenue, totalExpenses, totalSales, prevRevenue, prevExpenses, prevSales, dailyRevenue }: MetricCardsProps) {
  const lucro = totalRevenue - totalExpenses;
  const prevLucro = prevRevenue - prevExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Faturamento Total"
        value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        subtitle="vs período anterior"
        icon={DollarSign}
        trend={pctChange(totalRevenue, prevRevenue)}
        sparkData={dailyRevenue}
      />
      <MetricCard
        title="Despesas / Saídas"
        value={`R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        subtitle="vs período anterior"
        icon={TrendingDown}
        trend={pctChange(totalExpenses, prevExpenses)}
        color="hsl(var(--destructive))"
      />
      <MetricCard
        title="Lucro Líquido"
        value={`R$ ${lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        subtitle="vs período anterior"
        icon={TrendingUp}
        trend={pctChange(lucro, prevLucro)}
        color="hsl(var(--success))"
      />
      <MetricCard
        title="Total de Vendas"
        value={String(totalSales)}
        subtitle="no período"
        icon={ShoppingCart}
        trend={pctChange(totalSales, prevSales)}
      />
    </div>
  );
}
