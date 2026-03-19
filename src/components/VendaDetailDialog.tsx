import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, CreditCard, QrCode, FileText, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  const createdAt = new Date(venda.created_at);
  const isRecent = Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg">Venda #{venda.number}</span>
              <span className="ml-2 text-xs text-muted-foreground font-mono">({venda.id.slice(0, 8).toUpperCase()})</span>
              {isRecent && (
                <Badge className="ml-2 text-[10px]" variant="default">Recente</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

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
            <p className="font-semibold text-primary text-base tabular-nums">
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
      </DialogContent>
    </Dialog>
  );
}
