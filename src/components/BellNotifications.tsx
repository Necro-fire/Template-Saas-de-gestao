import { useState } from "react";
import { Bell, FileText, Check, Clock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBoletoAlertas } from "@/hooks/useBoletoAlertas";
import { format, isPast, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function BellNotifications() {
  const { alertas, updateStatus } = useBoletoAlertas();
  const [open, setOpen] = useState(false);
  const [showFuturos, setShowFuturos] = useState(false);

  const now = new Date();

  // Urgent: overdue OR due this month and still pendente
  const urgentes = alertas.filter((a) => {
    if (a.status !== "pendente") return false;
    const venc = new Date(a.data_vencimento);
    return isPast(venc) || isToday(venc) || isSameMonth(venc, now);
  });

  // Future: pendente but not yet due and not in current month
  const futuros = alertas.filter((a) => {
    if (a.status !== "pendente") return false;
    const venc = new Date(a.data_vencimento);
    return !isPast(venc) && !isToday(venc) && !isSameMonth(venc, now);
  });

  const handleMarkGerado = async (id: string) => {
    try {
      await updateStatus(id, "gerado");
      toast.success("Boleto marcado como gerado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const urgentCount = urgentes.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {urgentCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center animate-pulse">
              {urgentCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Alertas de Boleto
          </h4>
          <p className="text-xs text-muted-foreground">
            {urgentCount > 0
              ? `${urgentCount} boleto${urgentCount !== 1 ? "s" : ""} pendente${urgentCount !== 1 ? "s" : ""} (urgente)`
              : "Nenhum boleto pendente"}
          </p>
        </div>

        <div
          className="max-h-[400px] overflow-y-auto overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Urgent section */}
          {urgentes.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <p className="text-[11px] font-semibold text-destructive uppercase tracking-wide">
                  Pendentes — Ação Necessária
                </p>
              </div>
              {urgentes.map((alerta) => (
                <UrgentAlertaItem key={alerta.id} alerta={alerta} onMarkGerado={handleMarkGerado} />
              ))}
            </div>
          )}

          {urgentes.length === 0 && futuros.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhum boleto pendente
            </div>
          )}

          {/* Future section - collapsible */}
          {futuros.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => setShowFuturos(!showFuturos)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Ver futuros boletos ({futuros.length})
                </span>
                {showFuturos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showFuturos && (
                <div className="p-2 pt-0">
                  {futuros.map((alerta) => (
                    <FutureAlertaItem key={alerta.id} alerta={alerta} onMarkGerado={handleMarkGerado} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UrgentAlertaItem({ alerta, onMarkGerado }: { alerta: any; onMarkGerado: (id: string) => void }) {
  const venc = new Date(alerta.data_vencimento);
  const isOverdue = isPast(venc) && !isToday(venc);

  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 mb-1.5 transition-colors">
      <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 bg-destructive/20">
        <FileText className="h-4 w-4 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">
          Venda #{alerta.venda_number} — Parcela {alerta.parcela_numero}/{alerta.total_parcelas}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {alerta.client_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-medium flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-warning"}`}>
            <Clock className="h-3 w-3" />
            {isOverdue ? "Vencido " : "Vence "}
            {format(venc, "dd/MM/yy", { locale: ptBR })}
          </span>
          <span className="text-[11px] font-bold text-foreground">
            R$ {Number(alerta.valor_parcela).toFixed(2)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-[10px] px-2 shrink-0 border-destructive/30 hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation();
          onMarkGerado(alerta.id);
        }}
      >
        <Check className="h-3 w-3 mr-1" />
        Gerado
      </Button>
    </div>
  );
}

function FutureAlertaItem({ alerta, onMarkGerado }: { alerta: any; onMarkGerado: (id: string) => void }) {
  const venc = new Date(alerta.data_vencimento);

  return (
    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors">
      <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">
          Venda #{alerta.venda_number} — {alerta.parcela_numero}/{alerta.total_parcelas}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{alerta.client_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {format(venc, "dd/MM/yy", { locale: ptBR })}
          </span>
          <span className="text-[10px] font-medium">
            R$ {Number(alerta.valor_parcela).toFixed(2)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 text-[10px] px-1.5 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onMarkGerado(alerta.id);
        }}
      >
        <Check className="h-3 w-3" />
      </Button>
    </div>
  );
}
