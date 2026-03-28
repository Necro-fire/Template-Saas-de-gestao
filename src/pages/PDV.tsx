import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Trash2, ShoppingCart, Barcode, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useFilial } from "@/contexts/FilialContext";
import { useAuth } from "@/contexts/AuthContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, useClients, createVenda, type DbProduct } from "@/hooks/useSupabaseData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBlocker } from "react-router-dom";
import { SplitPaymentPanel, type PaymentEntry } from "@/components/pdv/SplitPaymentPanel";
import { ClientSearchPanel } from "@/components/pdv/ClientSearchPanel";
import { CreditCardInstallmentDialog } from "@/components/pdv/CreditCardInstallmentDialog";
import { BoletoConfigDialog } from "@/components/pdv/BoletoConfigDialog";
import { ProductImageDialog } from "@/components/pdv/ProductImageDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CartItem {
  cartId: string;
  product: DbProduct;
}

let cartIdCounter = 0;
function nextCartId() {
  return `cart-${++cartIdCounter}-${Date.now()}`;
}

export default function PDV() {
  const [search, setSearch] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);
  const [origin, setOrigin] = useState<"stock" | "bag">("stock");
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [creditCardInfo, setCreditCardInfo] = useState<{ installments: number; finalTotal: number } | null>(null);
  const [boletoInfo, setBoletoInfo] = useState<{ interval: string; installments: number; finalTotal: number } | null>(null);
  const [splitInstallmentEntryId, setSplitInstallmentEntryId] = useState<string | null>(null);
  const [splitInstallmentAmount, setSplitInstallmentAmount] = useState(0);
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { selectedFilial, setSelectedFilial } = useFilial();
  const { user, profile, hasPermission } = useAuth();
  const canSell = hasPermission('pdv', 'sell');
  const searchRef = useRef<HTMLInputElement>(null);
  const [pendingFilial, setPendingFilial] = useState<string | null>(null);

  const { data: products } = useProducts();
  const { data: clients } = useClients();

  const getPrice = (product: DbProduct) => {
    // Count how many of this product are in cart
    const qtyInCart = cart.filter(i => i.product.id === product.id).length;
    const hasWholesale = product.wholesale_price > 0 && product.wholesale_min_qty > 0;
    if (hasWholesale && qtyInCart >= product.wholesale_min_qty) {
      return Number(product.wholesale_price);
    }
    return Number(product.retail_price);
  };

  const subtotal = useMemo(() => {
    // Group by product to check wholesale thresholds
    const grouped = new Map<string, { product: DbProduct; count: number }>();
    for (const item of cart) {
      const existing = grouped.get(item.product.id);
      if (existing) {
        existing.count++;
      } else {
        grouped.set(item.product.id, { product: item.product, count: 1 });
      }
    }
    let total = 0;
    for (const { product, count } of grouped.values()) {
      const hasWholesale = product.wholesale_price > 0 && product.wholesale_min_qty > 0;
      const price = hasWholesale && count >= product.wholesale_min_qty
        ? Number(product.wholesale_price)
        : Number(product.retail_price);
      total += price * count;
    }
    return total;
  }, [cart]);

  const hasAnyWholesale = useMemo(() => {
    const grouped = new Map<string, { product: DbProduct; count: number }>();
    for (const item of cart) {
      const existing = grouped.get(item.product.id);
      if (existing) existing.count++;
      else grouped.set(item.product.id, { product: item.product, count: 1 });
    }
    for (const { product, count } of grouped.values()) {
      if (product.wholesale_price > 0 && product.wholesale_min_qty > 0 && count >= product.wholesale_min_qty) {
        return true;
      }
    }
    return false;
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const active = products.filter(p => p.status === "active" && p.stock > 0);
    if (!search) return active;
    const q = search.toLowerCase();
    return active.filter(p =>
      p.referencia.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [search, products]);

  const addToCart = useCallback((product: DbProduct) => {
    setCart(prev => {
      const qtyInCart = prev.filter(i => i.product.id === product.id).length;
      if (qtyInCart >= product.stock) {
        toast.error(`Estoque insuficiente. Disponível: ${product.stock}`);
        return prev;
      }
      const newQty = qtyInCart + 1;
      if (product.wholesale_price > 0 && product.wholesale_min_qty > 0 && newQty === product.wholesale_min_qty) {
        toast.success(`Atacado aplicado para ${product.referencia}!`, { duration: 3000 });
      }
      return [...prev, { cartId: nextCartId(), product }];
    });
  }, []);

  // Auto-add on exact barcode match
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (!value.trim()) return;
    const exactMatch = products.find(
      p => p.barcode && p.barcode === value.trim() && p.status === "active" && p.stock > 0
    );
    if (exactMatch) {
      addToCart(exactMatch);
      setSearch("");
      toast.success(`${exactMatch.referencia} adicionado`);
    }
  }, [products, addToCart]);

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const finalizeSale = async () => {
    if (!selectedClient) { toast.error("Selecione um cliente"); return; }
    if (cart.length === 0) { toast.error("Adicione produtos"); return; }

    if (isSplitPayment) {
      if (paymentEntries.length === 0) { toast.error("Adicione ao menos uma forma de pagamento"); return; }
      const totalPaid = paymentEntries.reduce((s, e) => s + e.amount, 0);
      const diff = Math.abs(totalPaid - subtotal);
      if (diff > 0.01) {
        if (totalPaid < subtotal) {
          toast.error("Não é possível finalizar: valor pago é inferior ao total da compra.");
        } else {
          toast.error("Não é possível finalizar: valor pago excede o total da compra.");
        }
        return;
      }
    } else {
      if (!paymentMethod) { toast.error("Selecione forma de pagamento"); return; }
    }

    const client = clients.find(c => c.id === selectedClient);
    const filialId = selectedFilial === "all" ? "1" : selectedFilial;

    setSubmitting(true);
    try {
      // Group cart items by product for the sale
      const grouped = new Map<string, { product: DbProduct; count: number }>();
      for (const item of cart) {
        const existing = grouped.get(item.product.id);
        if (existing) existing.count++;
        else grouped.set(item.product.id, { product: item.product, count: 1 });
      }

      const items = Array.from(grouped.values()).map(({ product, count }) => {
        const hasWholesale = product.wholesale_price > 0 && product.wholesale_min_qty > 0;
        const price = hasWholesale && count >= product.wholesale_min_qty
          ? Number(product.wholesale_price)
          : Number(product.retail_price);
        return {
          produto_id: product.id,
          product_code: product.referencia,
          product_model: product.referencia,
          quantity: count,
          unit_price: price,
          custo_unitario: (product as any).custo ?? 0,
        };
      });

      // Determine final method string and total with interest
      let finalMethod = isSplitPayment
        ? paymentEntries.map(e => {
            if (e.method === "cartao" && e.installments) {
              return `Cartão ${e.installments}x`;
            }
            const label = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão", debito: "Débito", boleto: "Boleto", prazo: "Prazo" }[e.method] || e.method;
            return label;
          }).join("/")
        : paymentMethod;

      let saleTotal = subtotal;
      if (isSplitPayment) {
        // Sum up: for credit card entries with installments, use finalTotal; otherwise use amount
        saleTotal = paymentEntries.reduce((sum, e) => {
          return sum + (e.method === "cartao" && e.finalTotal ? e.finalTotal : e.amount);
        }, 0);
      } else if (paymentMethod === "cartao" && creditCardInfo) {
        finalMethod = `Cartão de Crédito ${creditCardInfo.installments}x`;
        saleTotal = creditCardInfo.finalTotal;
      } else if (paymentMethod === "boleto" && boletoInfo) {
        finalMethod = `Boleto ${boletoInfo.installments}x/${boletoInfo.interval}d`;
        saleTotal = boletoInfo.finalTotal;
      }

      const discount = saleTotal > subtotal ? 0 : 0;
      const saleDiscount = 0;

      const splits = isSplitPayment
        ? paymentEntries.map(e => ({
            method: e.method,
            amount: e.method === "cartao" && e.finalTotal ? e.finalTotal : e.amount,
          }))
        : undefined;

      await createVenda(items, selectedClient, client?.store_name || "", finalMethod, origin, filialId, saleDiscount, user?.id, profile?.nome || user?.email || "", splits);

      toast.success(`Venda finalizada! Total: R$ ${saleTotal.toFixed(2)}`);
      setCart([]);
      setSelectedClient("");
      setPaymentMethod("");
      setIsSplitPayment(false);
      setPaymentEntries([]);
      setCreditCardInfo(null);
      setBoletoInfo(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao finalizar venda");
    } finally {
      setSubmitting(false);
    }
  };

  // Block navigation when cart has items
  const blocker = useBlocker(cart.length > 0);

  // Browser tab close / refresh warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cart.length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";

      if (e.key === "F2") {
        e.preventDefault();
        finalizeSale();
      } else if (e.key === "F4") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Delete" && !isInput) {
        e.preventDefault();
        if (cart.length > 0) {
          const last = cart[cart.length - 1];
          removeFromCart(last.cartId);
          toast.info(`${last.product.referencia} removido`);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSearch("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, finalizeSale]);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <FilialSelector onBeforeChange={(newFilial) => {
        if (cart.length > 0) {
          setPendingFilial(newFilial);
          return false;
        }
        return true;
      }} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Product Grid */}
        <div className="flex-[3] flex flex-col border-r overflow-hidden">
          <div className="p-4 pb-2 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-subhead font-semibold tracking-tighter">PDV</h1>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
                        <Keyboard className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Atalhos</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption space-y-1">
                      <p><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">F2</kbd> Finalizar venda</p>
                      <p><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">F4</kbd> Buscar produto</p>
                      <p><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">DEL</kbd> Remover último item</p>
                      <p><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">ESC</kbd> Limpar busca</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2">
                  <Label htmlFor="origin-toggle" className="text-caption text-muted-foreground">
                    {origin === "stock" ? "Estoque" : "Mala"}
                  </Label>
                  <Switch id="origin-toggle" checked={origin === "bag"} onCheckedChange={(checked) => setOrigin(checked ? "bag" : "stock")} />
                </div>
              </div>
            </div>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Código de barras ou nome do produto... (F4)"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 pt-2">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="rounded-md shadow-subtle bg-card p-3 text-left hover:shadow-card transition-all active:scale-[0.98] group">
                    <div
                      className="aspect-[3/2] rounded-sm bg-secondary flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        if (product.image_url) {
                          e.stopPropagation();
                          setZoomImage({ url: product.image_url, name: product.referencia });
                        } else {
                          addToCart(product);
                        }
                      }}
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.referencia} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground/20 text-subhead font-bold">{product.referencia}</span>
                      )}
                    </div>
                    <button onClick={() => addToCart(product)} className="w-full text-left mt-2">
                      <h3 className="text-ui font-medium truncate">{product.referencia}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="secondary" className="text-caption tabular-nums">{product.stock} un.</Badge>
                        <span className="text-ui font-medium tabular-nums text-primary">R$ {Number(product.retail_price)}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-ui font-medium">Nenhum produto encontrado</p>
                <p className="text-caption mt-1">Tente outro código ou nome</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Cart */}
         <div className="flex-[2] flex flex-col max-w-md">
          <div className="p-4 pb-2 space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-ui font-semibold">Sacola</h2>
              {hasAnyWholesale && <Badge className="bg-success text-success-foreground text-caption ml-auto">Atacado</Badge>}
            </div>
            <ClientSearchPanel
              clients={clients}
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
            />
          </div>

          <div className="flex-1 overflow-auto p-4 pt-2">
            <AnimatePresence mode="popLayout">
              {cart.map(item => (
                <motion.div key={item.cartId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-ui font-medium truncate">{item.product.referencia}</p>
                    <p className="text-caption text-muted-foreground">{item.product.color}</p>
                  </div>
                  <span className="text-ui font-medium tabular-nums text-primary w-16 text-right">R$ {Number(item.product.retail_price).toFixed(0)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.cartId)}><Trash2 className="h-3 w-3" /></Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-ui">Sacola vazia</p>
                <p className="text-caption">Escaneie um código de barras ou clique nos produtos</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t space-y-3 shrink-0">
            <SplitPaymentPanel
              total={subtotal}
              isSplit={isSplitPayment}
              onSplitChange={(split) => {
                setIsSplitPayment(split);
                setCreditCardInfo(null);
                setBoletoInfo(null);
              }}
              singleMethod={paymentMethod}
              onSingleMethodChange={(method) => {
                setPaymentMethod(method);
                setCreditCardInfo(null);
                setBoletoInfo(null);
                if (method === "cartao" && cart.length > 0) {
                  setShowCreditCardModal(true);
                } else if (method === "boleto" && cart.length > 0) {
                  setShowBoletoModal(true);
                }
              }}
              entries={paymentEntries}
              onEntriesChange={setPaymentEntries}
              onOpenInstallments={(entryId, entryAmount) => {
                setSplitInstallmentEntryId(entryId);
                setSplitInstallmentAmount(entryAmount);
                setShowCreditCardModal(true);
              }}
            />

            {/* Show credit card / boleto info badge */}
            {!isSplitPayment && paymentMethod === "cartao" && creditCardInfo && (
              <div className="flex items-center justify-between text-caption bg-secondary rounded-md px-3 py-1.5">
                <span className="text-muted-foreground">{creditCardInfo.installments}x de R$ {(creditCardInfo.finalTotal / creditCardInfo.installments).toFixed(2)} (total R$ {creditCardInfo.finalTotal.toFixed(2)})</span>
                <button className="text-primary text-xs underline" onClick={() => setShowCreditCardModal(true)}>Alterar</button>
              </div>
            )}
            {!isSplitPayment && paymentMethod === "boleto" && boletoInfo && (
              <div className="flex items-center justify-between text-caption bg-secondary rounded-md px-3 py-1.5">
                <span className="text-muted-foreground">{boletoInfo.installments}x a cada {boletoInfo.interval} dias</span>
                <button className="text-primary text-xs underline" onClick={() => setShowBoletoModal(true)}>Alterar</button>
              </div>
            )}

            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-caption text-muted-foreground">
                <span>{cart.length} {cart.length === 1 ? "item" : "itens"}</span>
                {hasAnyWholesale && <span className="text-success">Atacado aplicado</span>}
              </div>
              {(() => {
                const displayTotal = !isSplitPayment && paymentMethod === "cartao" && creditCardInfo
                  ? creditCardInfo.finalTotal
                  : !isSplitPayment && paymentMethod === "boleto" && boletoInfo
                    ? boletoInfo.finalTotal
                    : subtotal;
                const hasInterest = displayTotal > subtotal + 0.01;
                return (
                  <>
                    {hasInterest && (
                      <div className="flex justify-between text-caption text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-subhead font-semibold">
                      <span>Total{hasInterest ? " c/ juros" : ""}</span>
                      <motion.span key={displayTotal} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className={`tabular-nums ${hasAnyWholesale ? "text-success" : "text-foreground"}`}>
                        R$ {displayTotal.toFixed(2)}
                      </motion.span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10" onClick={() => { setCart([]); setCreditCardInfo(null); setBoletoInfo(null); }}>
                Cancelar
              </Button>
              <Button className="flex-1 h-10" onClick={finalizeSale} disabled={submitting || !canSell} title={!canSell ? "Sem permissão para vender" : undefined}>
                {submitting ? "Processando..." : "Finalizar (F2)"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation blocker alert */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sacola com produtos</AlertDialogTitle>
            <AlertDialogDescription>
              Se você sair agora, os produtos da sacola serão removidos. Deseja sair mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCart([]);
                blocker.proceed?.();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filial change blocker alert */}
      <AlertDialog open={pendingFilial !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sacola com produtos</AlertDialogTitle>
            <AlertDialogDescription>
              Ao trocar de filial, os produtos da sacola serão removidos. Deseja trocar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFilial(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCart([]);
                if (pendingFilial) setSelectedFilial(pendingFilial as any);
                setPendingFilial(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Trocar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credit Card Installment Modal */}
      <CreditCardInstallmentDialog
        open={showCreditCardModal}
        onOpenChange={(open) => {
          setShowCreditCardModal(open);
          if (!open) {
            setSplitInstallmentEntryId(null);
            setSplitInstallmentAmount(0);
          }
        }}
        total={splitInstallmentEntryId ? splitInstallmentAmount : subtotal}
        onConfirm={(installments, finalTotal) => {
          if (splitInstallmentEntryId) {
            // Update the split payment entry with installment info
            setPaymentEntries(prev =>
              prev.map(e => e.id === splitInstallmentEntryId
                ? { ...e, installments, finalTotal }
                : e
              )
            );
            setSplitInstallmentEntryId(null);
            setSplitInstallmentAmount(0);
          } else {
            setCreditCardInfo({ installments, finalTotal });
          }
        }}
      />

      {/* Boleto Config Modal */}
      <BoletoConfigDialog
        open={showBoletoModal}
        onOpenChange={setShowBoletoModal}
        total={subtotal}
        onConfirm={(interval, installments, finalTotal) => {
          setBoletoInfo({ interval, installments, finalTotal });
        }}
      />

      {/* Product Image Zoom */}
      <ProductImageDialog
        open={!!zoomImage}
        onOpenChange={(o) => { if (!o) setZoomImage(null); }}
        imageUrl={zoomImage?.url || ""}
        productName={zoomImage?.name || ""}
      />
    </div>
  );
}
