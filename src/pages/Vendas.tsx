import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Search, Banknote, CreditCard, QrCode, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { filiais } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { DateRangeFilter, useDateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { VendaDetailDialog } from "@/components/VendaDetailDialog";
import { useVendas, type DbVenda } from "@/hooks/useSupabaseData";

function getPaymentIcon(method: string) {
  const key = method.toLowerCase();
  if (key.includes("pix")) return <QrCode className="h-3.5 w-3.5" />;
  if (key.includes("cart") || key.includes("debit") || key.includes("credit")) return <CreditCard className="h-3.5 w-3.5" />;
  return <Banknote className="h-3.5 w-3.5" />;
}

export default function Vendas() {
  const { data: sales } = useVendas();
  const { preset, range, onChange } = useDateRangeFilter();
  const [search, setSearch] = useState("");
  const [selectedVenda, setSelectedVenda] = useState<DbVenda | null>(null);

  const filtered = useMemo(() => {
    let result = filterByDateRange(sales, range);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          String(s.number).includes(q) ||
          s.client_name.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sales, range, search]);

  const totalRevenue = filtered.reduce((acc, s) => acc + Number(s.total), 0);

  const getFilialName = (filialId: string) => filiais.find((f) => f.id === filialId)?.name || filialId;

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Vendas</h1>
            <p className="text-ui text-muted-foreground">
              {filtered.length} venda{filtered.length !== 1 ? "s" : ""} · R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
          <DateRangeFilter preset={preset} range={range} onChange={onChange} />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["dinheiro", "pix", "cartão de crédito", "cartão de débito"].map((method) => {
            const methodSales = filtered.filter((s) => s.payment_method.toLowerCase() === method);
            const methodTotal = methodSales.reduce((acc, s) => acc + Number(s.total), 0);
            return (
              <Card key={method} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {getPaymentIcon(method)}
                    <span className="text-xs capitalize">{method}</span>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">R$ {methodTotal.toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">{methodSales.length} venda{methodSales.length !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sales list */}
        {filtered.length > 0 ? (
          <div className="space-y-1">
            {filtered.map((sale) => {
              const createdAt = new Date(sale.created_at);
              const isRecent = Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;
              const isCancelled = sale.status === "cancelada";

              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedVenda(sale)}
                  className={`flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer ${
                    isCancelled ? "opacity-60 border-l-2 border-l-destructive" : isRecent ? "border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center ${isCancelled ? "bg-destructive/10" : "bg-primary/10"}`}>
                      {isCancelled ? <Ban className="h-4 w-4 text-destructive" /> : <FileText className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-ui font-medium ${isCancelled ? "line-through" : ""}`}>Venda #{sale.number}</p>
                        {isCancelled && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Cancelada</Badge>}
                        {!isCancelled && isRecent && <Badge className="text-[10px] h-4 px-1.5">Nova</Badge>}
                      </div>
                      <p className="text-caption text-muted-foreground">{sale.client_name || "Cliente avulso"}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <Badge variant="outline" className="text-caption">{getFilialName(sale.filial_id)}</Badge>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {getPaymentIcon(sale.payment_method)}
                      <span className="text-caption capitalize hidden sm:inline">{sale.payment_method}</span>
                    </div>
                    <div>
                      <p className={`text-ui font-medium tabular-nums ${isCancelled ? "line-through text-muted-foreground" : "text-primary"}`}>
                        R$ {Number(sale.total).toFixed(2)}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {format(createdAt, "dd/MM/yy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhuma venda encontrada</p>
            <p className="text-caption mt-1">Ajuste os filtros ou realize vendas pelo PDV</p>
          </div>
        )}
      </div>

      <VendaDetailDialog
        venda={selectedVenda}
        open={!!selectedVenda}
        onOpenChange={(open) => { if (!open) setSelectedVenda(null); }}
      />
    </div>
  );
}
