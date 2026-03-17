import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { filiais } from "@/contexts/FilialContext";
import { useProductTypes, type TipoProduto } from "@/hooks/useProductTypes";
import { toast } from "sonner";

export const LOW_STOCK_THRESHOLD = 3; // fallback only

export interface ProductFilterValues {
  search: string;
  tipo: string;
  filial: string;
  stockStatus: string;
  priceMin: string;
  priceMax: string;
}

const emptyFilters: ProductFilterValues = {
  search: "",
  tipo: "all",
  filial: "all",
  stockStatus: "all",
  priceMin: "",
  priceMax: "",
};

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
}

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilterValues>({ ...emptyFilters });
  return { filters, setFilters };
}

export function getStockStatus(stock: number, minStock?: number): "in_stock" | "low_stock" | "out_of_stock" {
  const threshold = minStock != null && minStock > 0 ? minStock : LOW_STOCK_THRESHOLD;
  if (stock === 0) return "out_of_stock";
  if (stock <= threshold) return "low_stock";
  return "in_stock";
}

export function applyProductFilters<T extends { model: string; code: string; color: string; stock: number; min_stock: number; retail_price: number; filial_id: string; status: string }>(
  products: T[],
  filters: ProductFilterValues
): T[] {
  return products.filter(p => {
    // Hide inactive by default
    if (p.status === "inativo") return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.model.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.color.toLowerCase().includes(q)) return false;
    }
    if (filters.tipo !== "all" && (p as any).tipo_produto_id !== filters.tipo) return false;
    if (filters.filial !== "all" && p.filial_id !== filters.filial) return false;

    const status = getStockStatus(p.stock);
    if (filters.stockStatus === "in_stock" && status !== "in_stock") return false;
    if (filters.stockStatus === "low_stock" && status !== "low_stock") return false;
    if (filters.stockStatus === "out_of_stock" && status !== "out_of_stock") return false;

    if (filters.priceMin && Number(p.retail_price) < Number(filters.priceMin)) return false;
    if (filters.priceMax && Number(p.retail_price) > Number(filters.priceMax)) return false;
    return true;
  });
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const { data: tipos } = useProductTypes();
  const [draft, setDraft] = useState<ProductFilterValues>({ ...filters });
  const [open, setOpen] = useState(false);
  const [priceError, setPriceError] = useState("");

  const activeCount = [
    filters.tipo !== "all",
    filters.filial !== "all",
    filters.stockStatus !== "all",
    !!filters.priceMin,
    !!filters.priceMax,
  ].filter(Boolean).length;

  const validatePrice = (d: ProductFilterValues): boolean => {
    if (d.priceMin && d.priceMax && Number(d.priceMin) > Number(d.priceMax)) {
      setPriceError("O preço mínimo não pode ser maior que o preço máximo.");
      return false;
    }
    setPriceError("");
    return true;
  };

  const handleApply = () => {
    if (!validatePrice(draft)) return;
    onChange({ ...draft, search: filters.search });
    setOpen(false);
  };

  const handleClear = () => {
    const cleared = { ...emptyFilters, search: filters.search };
    setDraft(cleared);
    setPriceError("");
    onChange(cleared);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por modelo, código ou cor..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9"
        />
      </div>

      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) { setDraft({ ...filters }); setPriceError(""); } }}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4" align="end">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filtros</h3>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-caption text-muted-foreground gap-1" onClick={handleClear}>
                <X className="h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>

          {tipos.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-caption">Tipo de Produto</Label>
              <Select value={draft.tipo} onValueChange={(v) => setDraft({ ...draft, tipo: v })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tipos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome_tipo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-caption">Filial</Label>
            <Select value={draft.filial} onValueChange={(v) => setDraft({ ...draft, filial: v })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Filiais</SelectItem>
                {filiais.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-caption">Estoque</Label>
            <Select value={draft.stockStatus} onValueChange={(v) => setDraft({ ...draft, stockStatus: v })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_stock">Em estoque (&gt; 3 un.)</SelectItem>
                <SelectItem value="low_stock">Estoque baixo (≤ 3 un.)</SelectItem>
                <SelectItem value="out_of_stock">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-caption">Faixa de Preço (R$)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Mín"
                value={draft.priceMin}
                onChange={(e) => { setDraft({ ...draft, priceMin: e.target.value }); setPriceError(""); }}
                className="h-8 text-sm"
              />
              <Input
                type="number"
                min="0"
                placeholder="Máx"
                value={draft.priceMax}
                onChange={(e) => { setDraft({ ...draft, priceMax: e.target.value }); setPriceError(""); }}
                className="h-8 text-sm"
              />
            </div>
            {priceError && (
              <p className="text-[11px] text-destructive">{priceError}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8" onClick={handleClear}>
              Limpar Filtros
            </Button>
            <Button size="sm" className="flex-1 h-8" onClick={handleApply}>
              Aplicar Filtros
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
