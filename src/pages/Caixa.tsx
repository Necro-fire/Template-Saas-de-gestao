import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

export default function Caixa() {
  const { filialLabel } = useFilial();

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Caixa</h1>
            <p className="text-ui text-muted-foreground">Controle de caixa — {filialLabel}</p>
          </div>
          <Button size="sm" className="gap-1.5">Abrir Caixa</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-caption text-muted-foreground">Saldo Atual</p>
              <p className="text-title font-semibold tabular-nums text-primary mt-1">R$ 0,00</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-success" />
                <p className="text-caption text-muted-foreground">Entradas Hoje</p>
              </div>
              <p className="text-title font-semibold tabular-nums text-success mt-1">R$ 0,00</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-destructive" />
                <p className="text-caption text-muted-foreground">Saídas Hoje</p>
              </div>
              <p className="text-title font-semibold tabular-nums text-destructive mt-1">R$ 0,00</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-ui font-semibold">Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-ui font-medium">Nenhuma movimentação no caixa</p>
              <p className="text-caption mt-1">As movimentações aparecerão aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
