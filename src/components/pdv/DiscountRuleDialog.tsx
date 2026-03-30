import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import type { DescontoAtacado } from "@/hooks/useDescontosAtacado";

interface DiscountRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: DescontoAtacado[];
  hasConflict: boolean;
  onConfirm: (selectedRules: DescontoAtacado[]) => void;
}

function getRuleLabel(rule: DescontoAtacado): string {
  const typeLabels: Record<string, string> = {
    todos: "Todos os produtos",
    todas_armacoes: "Todas as armações",
    todos_acessorios: "Todos os acessórios",
    armacao_especifica: `Armação: ${rule.categoria}`,
    acessorio_especifico: `Acessório: ${rule.categoria}`,
    produto: "Produto específico",
  };
  const type = typeLabels[rule.tipo_desconto] || rule.tipo_desconto;
  const discount = rule.tipo_valor === "percentual"
    ? `-${rule.valor_desconto}%`
    : `-R$ ${rule.valor_desconto.toFixed(2)}`;
  return `${type} (mín. ${rule.quantidade_minima} un.) → ${discount}`;
}

export function DiscountRuleDialog({ open, onOpenChange, rules, hasConflict, onConfirm }: DiscountRuleDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelected(new Set(rules.length === 1 ? [rules[0].id] : []));
    }
  }, [open, rules]);

  const allSelected = rules.length > 0 && selected.size === rules.length;

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rules.map(r => r.id)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Descontos disponíveis</DialogTitle>
          <DialogDescription>
            Foram identificadas {rules.length} regras de desconto aplicáveis. Selecione qual deseja aplicar:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {rules.map(rule => (
            <label
              key={rule.id}
              className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={selected.has(rule.id)}
                onCheckedChange={() => toggle(rule.id)}
              />
              <div className="flex-1">
                <span className="text-sm">{getRuleLabel(rule)}</span>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {rule.quantidade_minima} produtos
                  </Badge>
                </div>
              </div>
            </label>
          ))}
          {rules.length > 1 && (
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                hasConflict ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/50"
              }`}
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={selectAll}
                disabled={hasConflict}
              />
              <div>
                <span className="text-sm font-medium">Aplicar todos</span>
                {hasConflict && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Conflito de contagem — não é possível aplicar ambos
                  </div>
                )}
              </div>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Sem desconto
          </Button>
          <Button
            onClick={() => {
              onConfirm(rules.filter(r => selected.has(r.id)));
              onOpenChange(false);
            }}
            disabled={selected.size === 0}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
