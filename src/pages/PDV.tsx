import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Trash2, ShoppingCart, Barcode, Keyboard } from "lucide-react";
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
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, useClients, createVenda, type DbProduct } from "@/hooks/useSupabaseData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NumericStepper } from "@/components/ui/numeric-stepper";

interface CartItem {
  product: DbProduct;
  quantity: number;
}

export default function PDV() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [origin, setOrigin] = useState<"stock" | "bag">("stock");
  const [submitting, setSubmitting] = useState(false);
  const { selectedFilial } = useFilial();
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products } = useProducts();
  const { data: clients } = useClients();

  const getPrice = (product: DbProduct, quantity: number) => {
    const hasWholesale = product.wholesale_price > 0 && product.wholesale_min_qty > 0;
    if (hasWholesale && quantity >= product.wholesale_min_qty) {
      return Number(product.wholesale_price);
    }
    return Number(product.retail_price);
  };

  const isItemWholesale = (item: CartItem) => {
    return item.product.wholesale_price > 0 && item.product.wholesale_min_qty > 0 && item.quantity >= item.product.wholesale_min_qty;
  };

  const subtotal = cart.reduce((acc, item) => acc + getPrice(item.product, item.quantity) * item.quantity, 0);
  const hasAnyWholesale = cart.some(isItemWholesale);

  const filteredProducts = useMemo(() => {
    const active = products.filter(p => p.status === "active" && p.stock > 0);
    if (!search) return active;
    const q = search.toLowerCase();
    return active.filter(p =>
      p.model.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [search, products]);

  const addToCart = useCallback((product: DbProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Estoque insuficiente. Disponível: ${product.stock}`);
          return prev;
        }
        const updated = prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        // Check if this addition triggers wholesale for this product
        const newQty = existing.quantity + 1;
        if (product.wholesale_price > 0 && product.wholesale_min_qty > 0 && newQty === product.wholesale_min_qty) {
          toast.success(`Atacado aplicado para ${product.model}!`, { duration: 3000 });
        }
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
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
      toast.success(`${exactMatch.model} adicionado`);
    }
  }, [products, addToCart]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === productId) {
        const newQty = i.quantity + delta;
        if (newQty > i.product.stock) {
          toast.error(`Estoque insuficiente. Disponível: ${i.product.stock}`);
          return i;
        }
        return { ...i, quantity: Math.max(0, newQty) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const finalizeSale = async () => {
    if (!selectedClient) { toast.error("Selecione um cliente"); return; }
    if (cart.length === 0) { toast.error("Adicione produtos"); return; }
    if (!paymentMethod) { toast.error("Selecione forma de pagamento"); return; }

    const client = clients.find(c => c.id === selectedClient);
    const filialId = selectedFilial === "all" ? "1" : selectedFilial;

    setSubmitting(true);
    try {
      const items = cart.map(i => ({
        produto_id: i.product.id,
        product_code: i.product.code,
        product_model: i.product.model,
        quantity: i.quantity,
        unit_price: getPrice(i.product, i.quantity),
      }));

      await createVenda(items, selectedClient, client?.store_name || "", paymentMethod, origin, filialId);

      toast.success(`Venda finalizada! Total: R$ ${subtotal.toFixed(2)}`);
      setCart([]);
      setSelectedClient("");
      setPaymentMethod("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao finalizar venda");
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input/textarea (except our search)
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
          removeFromCart(last.product.id);
          toast.info(`${last.product.model} removido`);
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
      <FilialSelector />
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
                  <button key={product.id} onClick={() => addToCart(product)} className="rounded-md shadow-subtle bg-card p-3 text-left hover:shadow-card transition-all active:scale-[0.98] group">
                    <div className="aspect-[3/2] rounded-sm bg-secondary flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.model} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground/20 text-subhead font-bold">{product.code}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-caption text-muted-foreground">{product.barcode || product.code}</p>
                      <h3 className="text-ui font-medium truncate">{product.model}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="secondary" className="text-caption tabular-nums">{product.stock} un.</Badge>
                        <span className="text-ui font-medium tabular-nums text-primary">R$ {Number(product.retail_price)}</span>
                      </div>
                    </div>
                  </button>
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
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.store_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-auto p-4 pt-2">
            <AnimatePresence mode="popLayout">
              {cart.map(item => (
                <motion.div key={item.product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-ui font-medium truncate">{item.product.model}</p>
                    <p className="text-caption text-muted-foreground">{item.product.barcode || item.product.code} · {item.product.color}</p>
                  </div>
                  <NumericStepper
                    value={item.quantity}
                    onChange={(v) => updateQuantity(item.product.id, v - item.quantity)}
                    min={1}
                    max={item.product.stock}
                    size="sm"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-ui font-medium tabular-nums text-primary w-16 text-right">R$ {(getPrice(item.product, item.quantity) * item.quantity).toFixed(0)}</span>
                    {isItemWholesale(item) && <Badge variant="outline" className="text-[10px] px-1 py-0 text-success border-success">Atacado</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-3 w-3" /></Button>
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
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Forma de pagamento..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="prazo">Prazo</SelectItem>
              </SelectContent>
            </Select>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-caption text-muted-foreground">
                <span>{cart.reduce((a, i) => a + i.quantity, 0)} {cart.reduce((a, i) => a + i.quantity, 0) === 1 ? "item" : "itens"}</span>
                {hasAnyWholesale && <span className="text-success">Atacado aplicado</span>}
              </div>
              <div className="flex justify-between text-subhead font-semibold">
                <span>Total</span>
                <motion.span key={subtotal} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className={`tabular-nums ${hasAnyWholesale ? "text-success" : "text-foreground"}`}>
                  R$ {subtotal.toFixed(2)}
                </motion.span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setCart([])}>
                Cancelar
              </Button>
              <Button className="flex-1 h-10" onClick={finalizeSale} disabled={submitting}>
                {submitting ? "Processando..." : "Finalizar (F2)"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
