import { useState } from "react";
import { Bell, FileText, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoletoAlertas } from "@/hooks/useBoletoAlertas";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function BellNotifications() {
  const { alertas, updateStatus } = useBoletoAlertas();
  const [open, setOpen] = useState(false);

  // Show alerts that are due (vencimento <= today) and still pendente
  const pendentes = alertas.filter(
    (a) => a.status === "pendente" && (isPast(new Date(a.data_vencimento)) || isToday(new Date(a.data_vencimento)))
  );

  const allPending = alertas.filter((a) => a.status === "pendente");
  const upcoming = allPending.filter(
    (a) => !isPast(new Date(a.data_vencimento)) && !isToday(new Date(a.data_vencimento))
  );

  const handleMarkGerado = async (id: string) => {
    try {
      await updateStatus(id, "gerado");
      toast.success("Boleto marcado como gerado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const count = pendentes.length + upcoming.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold">Notificações</h4>
          <p className="text-xs text-muted-foreground">
            {count > 0 ? `${count} boleto${count !== 1 ? "s" : ""} pendente${count !== 1 ? "s" : ""}` : "Nenhuma notificação"}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {pendentes.length === 0 && upcoming.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Nenhum boleto pendente
            </div>
          )}

          {pendentes.length > 0 && (
            <div className="p-2">
              <p className="text-[11px] font-medium text-muted-foreground px-2 mb-1">VENCIDOS / HOJE</p>
              {pendentes.map((alerta) => (
                <AlertaItem key={alerta.id} alerta={alerta} onMarkGerado={handleMarkGerado} />
              ))}
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="p-2 border-t">
              <p className="text-[11px] font-medium text-muted-foreground px-2 mb-1">PRÓXIMOS</p>
              {upcoming.slice(0, 5).map((alerta) => (
                <AlertaItem key={alerta.id} alerta={alerta} onMarkGerado={handleMarkGerado} />
              ))}
              {upcoming.length > 5 && (
                <p className="text-[11px] text-muted-foreground text-center py-1">
                  +{upcoming.length - 5} mais
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AlertaItem({ alerta, onMarkGerado }: { alerta: any; onMarkGerado: (id: string) => void }) {
  const venc = new Date(alerta.data_vencimento);
  const isOverdue = isPast(venc) && !isToday(venc);

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors ${isOverdue ? "bg-destructive/5" : ""}`}>
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${isOverdue ? "bg-destructive/10" : "bg-primary/10"}`}>
        <FileText className={`h-4 w-4 ${isOverdue ? "text-destructive" : "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          Venda #{alerta.venda_number} — Parcela {alerta.parcela_numero}/{alerta.total_parcelas}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {alerta.client_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(venc, "dd/MM/yy", { locale: ptBR })}
          </span>
          <span className="text-[11px] font-medium text-primary">
            R$ {Number(alerta.valor_parcela).toFixed(2)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-[10px] px-2 shrink-0"
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
