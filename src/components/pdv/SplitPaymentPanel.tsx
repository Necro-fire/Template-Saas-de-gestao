import { useState, useEffect } from "react";
import { Plus, Trash2, Split, CreditCard, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INTEREST_RATES, BOLETO_MAX_INSTALLMENTS, BOLETO_RATE_PER_PERIOD, getBoletoInstallmentData, type BoletoInterval } from "@/lib/paymentUtils";

export interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
  installments?: number;
  finalTotal?: number;
  boletoInterval?: BoletoInterval;
}

const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão de Crédito" },
  { value: "debito", label: "Cartão de Débito" },
  { value: "boleto", label: "Boleto" },
  { value: "prazo", label: "Prazo" },
];

let entryCounter = 0;
function nextEntryId() {
  return `pay-${++entryCounter}-${Date.now()}`;
}

// ── Credit card inline installment picker ──
function CreditCardInlineConfig({
  amount,
  installments,
  finalTotal,
  onConfirm,
}: {
  amount: number;
  installments?: number;
  finalTotal?: number;
  onConfirm: (installments: number, finalTotal: number) => void;
}) {
  const [selected, setSelected] = useState(installments || 1);

  useEffect(() => {
    if (installments) setSelected(installments);
  }, [installments]);

  const getInstallmentData = (n: number) => {
    const rate = INTEREST_RATES[n];
    const ft = amount * (1 + rate / 100);
    return { rate, finalTotal: ft, installmentValue: ft / n };
  };

  const handleSelect = (n: number) => {
    setSelected(n);
    const data = getInstallmentData(n);
    onConfirm(n, data.finalTotal);
  };

  // Auto-confirm on first render if no installments set
  useEffect(() => {
    if (!installments && amount > 0) {
      const data = getInstallmentData(1);
      onConfirm(1, data.finalTotal);
    }
  }, []);

  const current = getInstallmentData(selected);

  return (
    <div className="ml-1 mt-1 space-y-1.5">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
          const data = getInstallmentData(n);
          const isSelected = selected === n;
          return (
            <button
              key={n}
              onClick={() => handleSelect(n)}
              className={cn(
                "rounded border px-1.5 py-1 text-left transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">{n}x</span>
                {isSelected && <Check className="h-2.5 w-2.5 text-primary" />}
              </div>
              <p className="text-[10px] tabular-nums">R$ {data.installmentValue.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">{data.rate}%</p>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] bg-secondary rounded px-2 py-1">
        <span className="text-muted-foreground">
          {selected}x R$ {current.installmentValue.toFixed(2)} | {current.rate}% juros
        </span>
        <span className="font-medium text-primary tabular-nums">
          R$ {current.finalTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ── Boleto inline installment picker ──
function BoletoInlineConfig({
  amount,
  installments,
  boletoInterval,
  onConfirm,
}: {
  amount: number;
  installments?: number;
  boletoInterval?: BoletoInterval;
  onConfirm: (interval: BoletoInterval, installments: number, finalTotal: number) => void;
}) {
  const [interval, setLocalInterval] = useState<BoletoInterval>(boletoInterval || "30");
  const [selected, setSelected] = useState(installments || 1);

  useEffect(() => {
    if (boletoInterval) setLocalInterval(boletoInterval);
    if (installments) setSelected(installments);
  }, [boletoInterval, installments]);

  const maxInstallments = BOLETO_MAX_INSTALLMENTS[interval];

  const handleIntervalChange = (val: BoletoInterval) => {
    setLocalInterval(val);
    const newSel = selected > BOLETO_MAX_INSTALLMENTS[val] ? BOLETO_MAX_INSTALLMENTS[val] : selected;
    setSelected(newSel);
    const data = getBoletoInstallmentData(newSel, val, amount);
    onConfirm(val, newSel, data.finalTotal);
  };

  const handleSelect = (n: number) => {
    setSelected(n);
    const data = getBoletoInstallmentData(n, interval, amount);
    onConfirm(interval, n, data.finalTotal);
  };

  // Auto-confirm on first render
  useEffect(() => {
    if (!installments && amount > 0) {
      const data = getBoletoInstallmentData(1, interval, amount);
      onConfirm(interval, 1, data.finalTotal);
    }
  }, []);

  const current = getBoletoInstallmentData(selected, interval, amount);
  const juros = current.finalTotal - amount;

  return (
    <div className="ml-1 mt-1 space-y-1.5">
      <Select value={interval} onValueChange={(v) => handleIntervalChange(v as BoletoInterval)}>
        <SelectTrigger className="h-7 text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15">A cada 15 dias (até 6x)</SelectItem>
          <SelectItem value="30">A cada 30 dias (até 3x)</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => {
          const data = getBoletoInstallmentData(n, interval, amount);
          const isSelected = selected === n;
          const totalDays = n * parseInt(interval);
          return (
            <button
              key={n}
              onClick={() => handleSelect(n)}
              className={cn(
                "rounded border px-1.5 py-1 text-left transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">{n}x</span>
                {isSelected && <Check className="h-2.5 w-2.5 text-primary" />}
              </div>
              <p className="text-[10px] tabular-nums">R$ {data.installmentValue.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">
                {totalDays}d{data.ratePercent > 0 ? ` +${data.ratePercent}%` : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] bg-secondary rounded px-2 py-1 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valor s/ juros</span>
          <span className="tabular-nums">R$ {amount.toFixed(2)}</span>
        </div>
        {juros > 0.01 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Juros ({current.ratePercent}%)</span>
            <span className="tabular-nums text-destructive">+ R$ {juros.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium border-t border-border/50 pt-0.5">
          <span>Total c/ juros</span>
          <span className="text-primary tabular-nums">R$ {current.finalTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Parcelas</span>
          <span className="tabular-nums">{selected}x R$ {current.installmentValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

interface SplitPaymentPanelProps {
  total: number;
  isSplit: boolean;
  onSplitChange: (split: boolean) => void;
  singleMethod: string;
  onSingleMethodChange: (method: string) => void;
  entries: PaymentEntry[];
  onEntriesChange: (entries: PaymentEntry[]) => void;
  // Single payment callbacks
  onCreditCardConfirm?: (installments: number, finalTotal: number) => void;
  onBoletoConfirm?: (interval: BoletoInterval, installments: number, finalTotal: number) => void;
  creditCardInfo?: { installments: number; finalTotal: number } | null;
  boletoInfo?: { interval: string; installments: number; finalTotal: number } | null;
}

export function SplitPaymentPanel({
  total,
  isSplit,
  onSplitChange,
  singleMethod,
  onSingleMethodChange,
  entries,
  onEntriesChange,
  onCreditCardConfirm,
  onBoletoConfirm,
  creditCardInfo,
  boletoInfo,
}: SplitPaymentPanelProps) {
  const addEntry = () => {
    const usedMethods = entries.map(e => e.method);
    const available = PAYMENT_METHODS.find(m => !usedMethods.includes(m.value));
    const remaining = total - entries.reduce((s, e) => s + e.amount, 0);
    onEntriesChange([
      ...entries,
      { id: nextEntryId(), method: available?.value || "pix", amount: Math.max(0, remaining) },
    ]);
  };

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: "method" | "amount", value: string | number) => {
    onEntriesChange(
      entries.map(e => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const updateEntryInstallments = (id: string, updates: Partial<PaymentEntry>) => {
    onEntriesChange(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const totalPaid = entries.reduce((s, e) => s + e.amount, 0);
  const diff = totalPaid - total;

  // ── Single payment mode ──
  if (!isSplit) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Select value={singleMethod} onValueChange={onSingleMethodChange}>
            <SelectTrigger className="h-9 flex-1">
              <SelectValue placeholder="Forma de pagamento..." />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inline credit card config */}
        {singleMethod === "cartao" && total > 0 && (
          <CreditCardInlineConfig
            amount={total}
            installments={creditCardInfo?.installments}
            finalTotal={creditCardInfo?.finalTotal}
            onConfirm={(inst, ft) => onCreditCardConfirm?.(inst, ft)}
          />
        )}

        {/* Inline boleto config */}
        {singleMethod === "boleto" && total > 0 && (
          <BoletoInlineConfig
            amount={total}
            installments={boletoInfo?.installments}
            boletoInterval={boletoInfo?.interval as BoletoInterval | undefined}
            onConfirm={(interval, inst, ft) => onBoletoConfirm?.(interval, inst, ft)}
          />
        )}

        <div className="flex items-center gap-2">
          <Switch
            id="split-toggle"
            checked={isSplit}
            onCheckedChange={(checked) => {
              onSplitChange(checked);
              if (checked && entries.length === 0) {
                onEntriesChange([
                  { id: nextEntryId(), method: singleMethod || "pix", amount: total },
                ]);
              }
            }}
          />
          <Label htmlFor="split-toggle" className="text-caption text-muted-foreground cursor-pointer">
            <Split className="inline h-3 w-3 mr-1" />
            Dividir pagamento
          </Label>
        </div>
      </div>
    );
  }

  // ── Split payment mode ──
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="split-toggle"
            checked={isSplit}
            onCheckedChange={(checked) => {
              onSplitChange(checked);
              if (!checked) {
                onEntriesChange([]);
              }
            }}
          />
          <Label htmlFor="split-toggle" className="text-caption text-muted-foreground cursor-pointer">
            <Split className="inline h-3 w-3 mr-1" />
            Dividir pagamento
          </Label>
        </div>
        {entries.length < PAYMENT_METHODS.length && (
          <Button variant="ghost" size="sm" className="h-7 text-caption" onClick={addEntry}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-0">
            <div className="flex items-center gap-2">
              <Select value={entry.method} onValueChange={(v) => {
                // Clear installment info when method changes
                onEntriesChange(
                  entries.map(e => e.id === entry.id
                    ? { ...e, method: v, installments: undefined, finalTotal: undefined, boletoInterval: undefined }
                    : e
                  )
                );
              }}>
                <SelectTrigger className="h-8 flex-1 text-caption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CurrencyInput
                value={entry.amount}
                onValueChange={(v) => updateEntry(entry.id, "amount", v)}
                className="h-8 w-28 text-caption tabular-nums"
              />
              {entries.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntry(entry.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Inline credit card config for split entry */}
            {entry.method === "cartao" && entry.amount > 0 && (
              <CreditCardInlineConfig
                amount={entry.amount}
                installments={entry.installments}
                finalTotal={entry.finalTotal}
                onConfirm={(inst, ft) => updateEntryInstallments(entry.id, { installments: inst, finalTotal: ft })}
              />
            )}

            {/* Inline boleto config for split entry */}
            {entry.method === "boleto" && entry.amount > 0 && (
              <BoletoInlineConfig
                amount={entry.amount}
                installments={entry.installments}
                boletoInterval={entry.boletoInterval}
                onConfirm={(interval, inst, ft) => updateEntryInstallments(entry.id, {
                  boletoInterval: interval,
                  installments: inst,
                  finalTotal: ft,
                })}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-caption">
        <span className="text-muted-foreground">Total pago:</span>
        <span className={`font-medium tabular-nums ${Math.abs(diff) < 0.01 ? "text-success" : "text-destructive"}`}>
          R$ {totalPaid.toFixed(2)}
        </span>
      </div>
      {diff < -0.01 && (
        <Badge variant="destructive" className="text-caption w-full justify-center">
          Faltam R$ {Math.abs(diff).toFixed(2)}
        </Badge>
      )}
      {diff > 0.01 && (
        <Badge variant="destructive" className="text-caption w-full justify-center">
          Excede R$ {diff.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}
