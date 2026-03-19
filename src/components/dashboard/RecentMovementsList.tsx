import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbCaixaMovimentacao } from "@/hooks/useCaixa";

interface Props {
  movimentacoes: DbCaixaMovimentacao[];
}

export function RecentMovementsList({ movimentacoes }: Props) {
  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold">Movimentações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-1 max-h-[280px] overflow-y-auto">
          {movimentacoes.slice(0, 10).map(m => {
            const isPositive = m.valor >= 0 && m.tipo !== "saida" && m.tipo !== "sangria" && m.tipo !== "cancelamento";
            return (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded flex items-center justify-center ${isPositive ? "bg-success/10" : "bg-destructive/10"}`}>
                    {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-caption font-medium capitalize">{m.tipo}</p>
                    <p className="text-caption text-muted-foreground truncate max-w-[180px]">{m.descricao || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-caption font-medium tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
                    {isPositive ? "+" : "-"}R$ {Math.abs(m.valor).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(m.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
            );
          })}
          {movimentacoes.length === 0 && (
            <p className="text-ui text-muted-foreground text-center py-4">Sem movimentações</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
