import { useState } from "react";
import { Bell, FileText, Check, Clock, ChevronDown, ChevronUp, AlertTriangle, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBoletoAlertas } from "@/hooks/useBoletoAlertas";
import { format, isPast, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

function classifyBoleto(alerta: { status: string; data_vencimento: string; parcela_numero?: number }) {
  if (alerta.status === "gerado") return "gerado";
  // 1ª parcela NUNCA é classificada como futuro
  if (alerta.parcela_numero === 1) return "pendente";
  const venc = new Date(alerta.data_vencimento);
  const now = new Date();
  if (isPast(venc) || isToday(venc) || isSameMonth(venc, now)) return "pendente";
  return "futuro";
}

export function BellNotifications() {
  const { alertas, updateStatus } = useBoletoAlertas();
  const [open, setOpen] = useState(false);
  const [showGerados, setShowGerados] = useState(false);
  const [showFuturos, setShowFuturos] = useState(false);

  const pendentes = alertas.filter((a) => classifyBoleto(a) === "pendente");
  const gerados = alertas.filter((a) => classifyBoleto(a) === "gerado");
  const futuros = alertas.filter((a) => classifyBoleto(a) === "futuro");

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(`Status alterado para ${newStatus}`);
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const urgentCount = pendentes.length;

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
      <PopoverContent className="w-[420px] p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Central de Boletos
          </h4>
          <p className="text-xs text-muted-foreground">
            {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""} · {gerados.length} gerado{gerados.length !== 1 ? "s" : ""} · {futuros.length} futuro{futuros.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="max-h-[450px] overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {/* Pendentes */}
          {pendentes.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <p className="text-[11px] font-semibold text-destructive uppercase tracking-wide">
                  Pendentes ({pendentes.length})
                </p>
              </div>
              {pendentes.map((a) => (
                <BoletoItem key={a.id} alerta={a} variant="pendente" onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {/* Gerados - collapsible */}
          {gerados.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => setShowGerados(!showGerados)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Gerados ({gerados.length})
                </span>
                {showGerados ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showGerados && (
                <div className="p-2 pt-0">
                  {gerados.map((a) => (
                    <BoletoItem key={a.id} alerta={a} variant="gerado" onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Futuros - collapsible */}
          {futuros.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => setShowFuturos(!showFuturos)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Futuros ({futuros.length})
                </span>
                {showFuturos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showFuturos && (
                <div className="p-2 pt-0">
                  {futuros.map((a) => (
                    <BoletoItem key={a.id} alerta={a} variant="futuro" onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>
          )}

          {pendentes.length === 0 && gerados.length === 0 && futuros.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhum boleto registrado
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BoletoItem({
  alerta,
  variant,
  onStatusChange,
}: {
  alerta: any;
  variant: "pendente" | "gerado" | "futuro";
  onStatusChange: (id: string, status: string) => void;
}) {
  const venc = new Date(alerta.data_vencimento);
  const isOverdue = isPast(venc) && !isToday(venc);

  const bgClass =
    variant === "pendente"
      ? "bg-destructive/10 border border-destructive/20"
      : variant === "gerado"
      ? "bg-primary/5 border border-primary/20"
      : "hover:bg-secondary/50";

  const iconBg =
    variant === "pendente"
      ? "bg-destructive/20"
      : variant === "gerado"
      ? "bg-primary/20"
      : "bg-muted";

  const iconColor =
    variant === "pendente"
      ? "text-destructive"
      : variant === "gerado"
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md mb-1.5 transition-colors ${bgClass}`}>
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
        <FileText className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">
          Venda #{alerta.venda_number} — Parcela {alerta.parcela_numero}/{alerta.total_parcelas}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{alerta.client_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-medium flex items-center gap-1 ${
            variant === "pendente" && isOverdue ? "text-destructive" : 
            variant === "pendente" ? "text-warning" : "text-muted-foreground"
          }`}>
            <Clock className="h-3 w-3" />
            {variant === "pendente" && isOverdue ? "Vencido " : "Vence "}
            {format(venc, "dd/MM/yy", { locale: ptBR })}
          </span>
          <span className="text-[11px] font-bold text-foreground">
            R$ {Number(alerta.valor_parcela).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Select
          value={alerta.status}
          onValueChange={(v) => onStatusChange(alerta.id, v)}
        >
          <SelectTrigger className="h-7 text-[10px] px-2 w-auto min-w-[90px] border-border/50">
            <Badge
              variant={
                alerta.status === "gerado" ? "default" :
                alerta.status === "pendente" ? "destructive" : "secondary"
              }
              className="text-[10px] h-4 px-1.5"
            >
              {alerta.status === "gerado" ? "Gerado" : alerta.status === "pendente" ? "Pendente" : "Futuro"}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="gerado">Gerado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
