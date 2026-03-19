import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DbCaixa, DbCaixaMovimentacao } from "@/hooks/useCaixa";

interface Props {
  caixas: DbCaixa[];
  movimentacoes: DbCaixaMovimentacao[];
}

export function CaixaSummary({ caixas, movimentacoes }: Props) {
  const caixaAberto = caixas.find(c => c.status === "aberto");
  const entradas = movimentacoes.filter(m => m.tipo === "venda" || m.tipo === "entrada").reduce((s, m) => s + Math.abs(m.valor), 0);
  const saidas = movimentacoes.filter(m => m.tipo === "saida" || m.tipo === "cancelamento" || m.tipo === "sangria").reduce((s, m) => s + Math.abs(m.valor), 0);
  const saldo = (caixaAberto?.valor_abertura || 0) + entradas - saidas;

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-ui font-semibold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Resumo do Caixa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={caixaAberto ? "default" : "outline"} className="text-caption">
            {caixaAberto ? "Aberto" : "Fechado"}
          </Badge>
          {caixaAberto && (
            <span className="text-caption text-muted-foreground">
              Abertura: R$ {caixaAberto.valor_abertura.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-md bg-success/5">
            <div className="flex items-center justify-center gap-1 text-success">
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-caption">Entradas</span>
            </div>
            <p className="text-ui font-semibold tabular-nums mt-0.5">R$ {entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-destructive/5">
            <div className="flex items-center justify-center gap-1 text-destructive">
              <ArrowDownRight className="h-3 w-3" />
              <span className="text-caption">Saídas</span>
            </div>
            <p className="text-ui font-semibold tabular-nums mt-0.5">R$ {saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-primary/5">
            <span className="text-caption text-muted-foreground">Saldo</span>
            <p className="text-ui font-semibold tabular-nums mt-0.5 text-primary">R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {movimentacoes.slice(0, 5).map(m => (
            <div key={m.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-secondary/50 text-caption">
              <span className="truncate">{m.descricao || m.tipo}</span>
              <span className={`font-medium tabular-nums ${m.valor >= 0 ? "text-success" : "text-destructive"}`}>
                {m.valor >= 0 ? "+" : ""}R$ {Math.abs(m.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
