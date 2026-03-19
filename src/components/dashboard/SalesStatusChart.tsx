import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  concluidas: number;
  canceladas: number;
}

const COLORS = ["hsl(var(--success))", "hsl(var(--destructive))"];

export function SalesStatusChart({ concluidas, canceladas }: Props) {
  const data = [
    { name: "Concluídas", value: concluidas },
    { name: "Canceladas", value: canceladas },
  ].filter(d => d.value > 0);

  const total = concluidas + canceladas;

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold">Status das Vendas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-[220px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v, "Vendas"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-ui">Sem vendas no período</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
