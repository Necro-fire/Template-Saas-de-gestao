import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, CreditCard, QrCode, FileText, Package, Ban, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cancelarVenda } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { DbVenda, DbVendaItem } from "@/hooks/useSupabaseData";

interface VendaDetailDialogProps {
  venda: DbVenda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentIcons: Record<string, React.ReactNode> = {
  dinheiro: <Banknote className="h-4 w-4" />,
  pix: <QrCode className="h-4 w-4" />,
  "cartão de débito": <CreditCard className="h-4 w-4" />,
  "cartão de crédito": <CreditCard className="h-4 w-4" />,
  debito: <CreditCard className="h-4 w-4" />,
  credito: <CreditCard className="h-4 w-4" />,
};

function getPaymentIcon(method: string) {
  const key = method.toLowerCase();
  for (const [k, icon] of Object.entries(paymentIcons)) {
    if (key.includes(k)) return icon;
  }
  return <Banknote className="h-4 w-4" />;
}

export function VendaDetailDialog({ venda, open, onOpenChange }: VendaDetailDialogProps) {
  const [items, setItems] = useState<DbVendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!venda || !open) return;
    setLoading(true);
    (supabase as any)
      .from("venda_items")
      .select("*")
      .eq("venda_id", venda.id)
      .then(({ data }: { data: DbVendaItem[] | null }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [venda, open]);

  if (!venda) return null;

  const isCancelled = venda.status === "cancelada";
  const createdAt = new Date(venda.created_at);
  const isRecent = Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;

  const handleCancel = async () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }
    setCancelling(true);
    try {
      await cancelarVenda(
        venda.id,
        motivo.trim(),
        user?.id || "",
        user?.nome || user?.email || ""
      );
      toast.success("Venda cancelada com sucesso");
      setShowCancelConfirm(false);
      setMotivo("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar venda");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isCancelled ? "bg-destructive/10" : "bg-primary/10"}`}>
                {isCancelled ? <Ban className="h-5 w-5 text-destructive" /> : <FileText className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <span className="text-lg">Venda #{venda.number}</span>
                <span className="ml-2 text-xs text-muted-foreground font-mono">({venda.id.slice(0, 8).toUpperCase()})</span>
                {isCancelled && (
                  <Badge className="ml-2 text-[10px]" variant="destructive">Cancelada</Badge>
                )}
                {!isCancelled && isRecent && (
                  <Badge className="ml-2 text-[10px]" variant="default">Recente</Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Cancellation info banner */}
          {isCancelled && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Venda cancelada</p>
                {venda.cancelled_at && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Em {format(new Date(venda.cancelled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    {venda.cancelled_by_name && ` por ${venda.cancelled_by_name}`}
                  </p>
                )}
                {venda.motivo_cancelamento && (
                  <p className="text-muted-foreground text-xs mt-1">Motivo: {venda.motivo_cancelamento}</p>
                )}
              </div>
            </div>
          )}

          {/* General info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Data e hora</p>
              <p className="font-medium">{format(createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cliente</p>
              <p className="font-medium">{venda.client_name || "Cliente avulso"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Origem</p>
              <Badge variant="secondary">{venda.origin === "bag" ? "Mala" : "Estoque"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Valor total</p>
              <p className={`font-semibold text-base tabular-nums ${isCancelled ? "line-through text-muted-foreground" : "text-primary"}`}>
                R$ {Number(venda.total).toFixed(2)}
              </p>
            </div>
          </div>

          {venda.discount > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Desconto aplicado</p>
              <p className="font-medium text-destructive">- R$ {Number(venda.discount).toFixed(2)}</p>
            </div>
          )}

          <Separator />

          {/* Payment */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              {getPaymentIcon(venda.payment_method)}
              Pagamento
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{venda.payment_method}</Badge>
              <span className="text-sm tabular-nums font-medium">R$ {Number(venda.total).toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos ({items.length})
            </h4>

            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Carregando itens...</p>
            ) : items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{item.product_model}</p>
                        <p className="text-xs text-muted-foreground">{item.product_code}</p>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">R$ {Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">R$ {Number(item.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum item encontrado</p>
            )}
          </div>

          {venda.seller_name && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">Vendedor</p>
                <p className="font-medium">{venda.seller_name}</p>
              </div>
            </>
          )}

          {/* Cancel button */}
          {!isCancelled && (
            <>
              <Separator />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowCancelConfirm(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancelar Venda
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancelar Venda #{venda.number}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá reverter automaticamente o estoque e o financeiro.
              A venda permanecerá visível no sistema com status cancelada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium mb-1.5 block">Motivo do cancelamento *</label>
            <Textarea
              placeholder="Informe o motivo do cancelamento..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              disabled={cancelling || !motivo.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? "Cancelando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
