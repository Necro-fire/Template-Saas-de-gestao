import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const BOLETO_INTEREST_PER_INSTALLMENT = {
  "15": 3,
  "30": 6,
} as const;

const MAX_INSTALLMENTS = {
  "15": 6,
  "30": 3,
} as const;

type BoletoInterval = "15" | "30";

interface BoletoConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (interval: string, installments: number, finalTotal: number) => void;
}

export function BoletoConfigDialog({
  open,
  onOpenChange,
  total,
  onConfirm,
}: BoletoConfigDialogProps) {
  const [interval, setInterval] = useState<BoletoInterval>("30");
  const [installments, setInstallments] = useState(1);

  const maxInstallments = MAX_INSTALLMENTS[interval];
  const interestPerInstallment = BOLETO_INTEREST_PER_INSTALLMENT[interval];

  // Juros começam apenas após 30 dias
  const getInstallmentData = (n: number) => {
    if (interval === "15") {
      // 15 dias: parcelas a cada 15 dias. Juros só após 30 dias.
      // Parcela 1 = dia 15 (sem juros), Parcela 2 = dia 30 (sem juros), Parcela 3+ = com juros
      let totalWithInterest = 0;
      const installmentBase = total / n;
      for (let i = 1; i <= n; i++) {
        const daysUntil = i * 15;
        if (daysUntil > 30) {
          totalWithInterest += installmentBase * (1 + interestPerInstallment / 100);
        } else {
          totalWithInterest += installmentBase;
        }
      }
      return { finalTotal: totalWithInterest, installmentValue: totalWithInterest / n };
    } else {
      // 30 dias: parcelas a cada 30 dias. Juros só após 30 dias.
      // Parcela 1 = dia 30 (sem juros), Parcela 2+ = com juros
      let totalWithInterest = 0;
      const installmentBase = total / n;
      for (let i = 1; i <= n; i++) {
        const daysUntil = i * 30;
        if (daysUntil > 30) {
          totalWithInterest += installmentBase * (1 + interestPerInstallment / 100);
        } else {
          totalWithInterest += installmentBase;
        }
      }
      return { finalTotal: totalWithInterest, installmentValue: totalWithInterest / n };
    }
  };

  // Clamp installments when interval changes
  const handleIntervalChange = (val: BoletoInterval) => {
    setInterval(val);
    if (installments > MAX_INSTALLMENTS[val]) {
      setInstallments(MAX_INSTALLMENTS[val]);
    }
  };

  const { finalTotal, installmentValue } = getInstallmentData(installments);
  const jurosTotal = finalTotal - total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Configurar Boleto
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-1">
          Valor original: <span className="font-semibold text-foreground">R$ {total.toFixed(2)}</span>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm">Intervalo entre parcelas</Label>
            <Select value={interval} onValueChange={(v) => handleIntervalChange(v as BoletoInterval)}>
              <SelectTrigger className="h-9 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">A cada 15 dias (até 6x)</SelectItem>
                <SelectItem value="30">A cada 30 dias (até 3x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Número de parcelas</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => {
                const data = getInstallmentData(n);
                const isSelected = installments === n;
                return (
                  <button
                    key={n}
                    onClick={() => setInstallments(n)}
                    className={cn(
                      "rounded-lg border p-2.5 text-left transition-all hover:border-primary/50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{n}x</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-xs font-medium tabular-nums mt-1">
                      R$ {data.installmentValue.toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-secondary p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Parcelas</span>
            <span className="font-medium">{installments}x de R$ {installmentValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Intervalo</span>
            <span className="font-medium">{interval} dias</span>
          </div>
          {jurosTotal > 0.01 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Juros ({interestPerInstallment}% por parcela)</span>
              <span className="font-medium text-destructive">+ R$ {jurosTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-1 border-t border-border/50">
            <span>Total final</span>
            <span className="text-primary tabular-nums">R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => { onConfirm(interval, installments, finalTotal); onOpenChange(false); }}>
            Confirmar Boleto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
