import { useState } from "react";
import { Filter, X, Search, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useFilial } from "@/contexts/FilialContext";
import { useProductTypes, type TipoProduto } from "@/hooks/useProductTypes";
import {
  CATEGORIAS_IDADE, GENEROS, ESTILOS, TODAS_CORES,
  MATERIAIS_ARO, MATERIAIS_HASTE, TIPOS_LENTE,
} from "@/data/productConstants";
import { ACESSORIOS_CATEGORIAS, getTiposByCategoria } from "@/data/accessoryConstants";

export type StockLevel = "normal" | "low" | "critical" | "out_of_stock";

export interface ProductFilterValues {
  search: string;
  tipoItem: string;
  tipo: string;
  categoriaIdade: string;
  genero: string;
  estilo: string;
  corArmacao: string;
  materialAro: string;
  materialHaste: string;
  tipoLente: string;
  // Accessory hierarchical filters
  catAcessorio: string;
  tipoAcessorio: string;
  corAcessorio: string;
  priceMin: string;
  priceMax: string;
  filial: string;
  stockStatus: string;
}

const emptyFilters: ProductFilterValues = {
  search: "",
  tipoItem: "all",
  tipo: "all",
  categoriaIdade: "all",
  genero: "all",
  estilo: "all",
  corArmacao: "all",
  
  materialAro: "all",
  materialHaste: "all",
  tipoLente: "all",
  catAcessorio: "all",
  tipoAcessorio: "all",
  corAcessorio: "all",
  priceMin: "",
  priceMax: "",
  filial: "all",
  stockStatus: "all",
};

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilterValues>({ ...emptyFilters });
  return { filters, setFilters };
}

/**
 * Get the category minimum for a product by looking up its tipo_produto_id in the tipos list.
 * Falls back to 0 if no category is assigned.
 */
export function getCategoryMin(product: { tipo_produto_id: string | null }, tipos: TipoProduto[]): number {
  if (!product.tipo_produto_id) return 0;
  const tipo = tipos.find(t => t.id === product.tipo_produto_id);
  return tipo?.estoque_minimo_alerta ?? 0;
}

/**
 * Stock level: out_of_stock if 0, normal otherwise.
 */
export function getStockLevel(stock: number, categoryMin: number): StockLevel {
  if (stock === 0) return "out_of_stock";
  return "normal";
}

/** Legacy compat */
export function getStockStatus(stock: number, minStock?: number): "in_stock" | "low_stock" | "out_of_stock" {
  const level = getStockLevel(stock, minStock ?? 0);
  if (level === "out_of_stock") return "out_of_stock";
  if (level === "critical" || level === "low") return "low_stock";
  return "in_stock";
}

export function applyProductFilters<T extends {
  model: string; code: string; color: string; stock: number; min_stock: number;
  retail_price: number; filial_id: string; status: string; is_acessorio: boolean;
  categoria_idade: string; genero: string; estilo: string; cor_armacao: string;
  material: string; material_aro: string; material_haste: string; tipo_lente: string;
  tipo_produto_id: string | null;
}>(
  products: T[],
  filters: ProductFilterValues,
  tipos?: TipoProduto[]
): T[] {
  return products.filter(p => {
    if (p.status === "inativo") return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.model.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.color.toLowerCase().includes(q)) return false;
    }

    if (filters.tipoItem === "normal" && p.is_acessorio) return false;
    if (filters.tipoItem === "acessorio" && !p.is_acessorio) return false;
    if (filters.tipo !== "all" && p.tipo_produto_id !== filters.tipo) return false;

    if (filters.categoriaIdade !== "all" && p.categoria_idade !== filters.categoriaIdade) return false;
    if (filters.genero !== "all" && p.genero !== filters.genero) return false;
    if (filters.estilo !== "all" && p.estilo !== filters.estilo) return false;
    if (filters.corArmacao !== "all" && p.cor_armacao !== filters.corArmacao) return false;
    
    if (filters.materialAro !== "all" && p.material_aro !== filters.materialAro) return false;
    if (filters.materialHaste !== "all" && p.material_haste !== filters.materialHaste) return false;
    if (filters.tipoLente !== "all" && p.tipo_lente !== filters.tipoLente) return false;

    // Accessory hierarchical filters
    if (filters.catAcessorio !== "all") {
      const pCat = (p as any).categoria_acessorio || "";
      if (pCat !== filters.catAcessorio) return false;
    }
    if (filters.tipoAcessorio !== "all") {
      const pTipo = (p as any).tipo_acessorio || "";
      if (pTipo !== filters.tipoAcessorio) return false;
    }
    if (filters.corAcessorio !== "all") {
      const pCor = (p as any).cor_acessorio || "";
      if (filters.corAcessorio === "Nenhuma") {
        if (pCor && pCor !== "" && pCor !== "Nenhuma") return false;
      } else {
        if (pCor !== filters.corAcessorio) return false;
      }
    }

    if (filters.filial !== "all" && p.filial_id !== filters.filial) return false;

    if (filters.stockStatus !== "all") {
      const catMin = tipos ? getCategoryMin(p, tipos) : (p.min_stock || 0);
      const level = getStockLevel(p.stock, catMin);
      if (filters.stockStatus === "normal" && level !== "normal") return false;
      if (filters.stockStatus === "low" && level !== "low") return false;
      if (filters.stockStatus === "critical" && level !== "critical") return false;
      if (filters.stockStatus === "out_of_stock" && level !== "out_of_stock") return false;
    }

    if (filters.priceMin && Number(p.retail_price) < Number(filters.priceMin)) return false;
    if (filters.priceMax && Number(p.retail_price) > Number(filters.priceMax)) return false;
    return true;
  });
}

function FilterSelect({ label, value, onValueChange, options, allLabel = "Todos" }: {
  label: string; value: string; onValueChange: (v: string) => void;
  options: readonly string[] | string[]; allLabel?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-caption">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const { data: tipos } = useProductTypes();
  const { selectedFilial, filiais } = useFilial();
  const filialLocked = selectedFilial !== "all";
  const [draft, setDraft] = useState<ProductFilterValues>({ ...filters });
  const [open, setOpen] = useState(false);
  const [priceError, setPriceError] = useState("");

  const countActive = (f: ProductFilterValues) => {
    const keys: (keyof ProductFilterValues)[] = [
      "tipoItem", "tipo", "categoriaIdade", "genero", "estilo", "corArmacao",
      "materialAro", "materialHaste", "tipoLente",
      "catAcessorio", "tipoAcessorio", "corAcessorio",
      "filial", "stockStatus",
    ];
    let count = keys.filter(k => f[k] !== "all").length;
    if (f.priceMin) count++;
    if (f.priceMax) count++;
    return count;
  };

  const activeCount = countActive(filters);
  const showAccessoryFilters = draft.tipoItem === "acessorio" || draft.tipoItem === "all";
  const showFrameFilters = draft.tipoItem === "normal" || draft.tipoItem === "all";

  // Cascading types for accessory filter
  const tiposAcFiltro = draft.catAcessorio !== "all" ? getTiposByCategoria(draft.catAcessorio) : [];

  const validatePrice = (d: ProductFilterValues): boolean => {
    if (d.priceMin && d.priceMax && Number(d.priceMin) > Number(d.priceMax)) {
      setPriceError("Valor mínimo não pode ser maior que o máximo");
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

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setDraft({ ...filters }); setPriceError(""); } }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-96 max-w-[95vw] p-0">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-semibold">Filtros</DialogTitle>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-caption text-muted-foreground gap-1" onClick={handleClear}>
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[460px]">
            <div className="p-4 pt-2 space-y-3">
              <div className="space-y-1">
                <Label className="text-caption">Tipo de Item</Label>
                <Select value={draft.tipoItem} onValueChange={(v) => setDraft({ ...draft, tipoItem: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Produto Normal</SelectItem>
                    <SelectItem value="acessorio">Acessório</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipos.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-caption">Tipo de Produto</Label>
                  <Select value={draft.tipo} onValueChange={(v) => setDraft({ ...draft, tipo: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {tipos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome_tipo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showFrameFilters && (
                <>
                  <Separator />
                  <p className="text-caption text-muted-foreground font-medium">Armação</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FilterSelect label="Categoria Idade" value={draft.categoriaIdade}
                      onValueChange={(v) => setDraft({ ...draft, categoriaIdade: v })} options={CATEGORIAS_IDADE} allLabel="Todas" />
                    <FilterSelect label="Gênero" value={draft.genero}
                      onValueChange={(v) => setDraft({ ...draft, genero: v })} options={GENEROS} />
                  </div>
                  <FilterSelect label="Estilo" value={draft.estilo}
                    onValueChange={(v) => setDraft({ ...draft, estilo: v })} options={ESTILOS} />
                  <FilterSelect label="Cor da Armação" value={draft.corArmacao}
                    onValueChange={(v) => setDraft({ ...draft, corArmacao: v })} options={TODAS_CORES} allLabel="Todas" />
                  <div className="grid grid-cols-2 gap-3">
                    <FilterSelect label="Material Aro" value={draft.materialAro}
                      onValueChange={(v) => setDraft({ ...draft, materialAro: v })} options={MATERIAIS_ARO} />
                    <FilterSelect label="Material Haste" value={draft.materialHaste}
                      onValueChange={(v) => setDraft({ ...draft, materialHaste: v })} options={MATERIAIS_HASTE} />
                  </div>
                  <FilterSelect label="Tipo de Lente" value={draft.tipoLente}
                    onValueChange={(v) => setDraft({ ...draft, tipoLente: v })} options={TIPOS_LENTE} />
                </>
              )}

              {showAccessoryFilters && (
                <>
                  <Separator />
                  <p className="text-caption text-muted-foreground font-medium">Acessório</p>
                  <FilterSelect
                    label="Categoria"
                    value={draft.catAcessorio}
                    onValueChange={(v) => setDraft({ ...draft, catAcessorio: v, tipoAcessorio: "all", corAcessorio: "all" })}
                    options={ACESSORIOS_CATEGORIAS.map(c => c.nome)}
                    allLabel="Todas"
                  />
                  {tiposAcFiltro.length > 0 && (
                    <FilterSelect
                      label="Tipo"
                      value={draft.tipoAcessorio}
                      onValueChange={(v) => setDraft({ ...draft, tipoAcessorio: v })}
                      options={tiposAcFiltro.map(t => t.nome)}
                    />
                  )}
                  <div className="space-y-1">
                    <Label className="text-caption">Cor do Acessório</Label>
                    <Select value={draft.corAcessorio} onValueChange={(v) => setDraft({ ...draft, corAcessorio: v })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                        {TODAS_CORES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Separator />
              <p className="text-caption text-muted-foreground font-medium">Estoque</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-caption flex items-center gap-1">
                    Filial
                    {filialLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </Label>
                  {filialLocked ? (
                    <div>
                      <Input value={`Filial ${selectedFilial}`} disabled className="h-8 text-sm bg-muted" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Use "Todas" para filtrar por filial</p>
                    </div>
                  ) : (
                    <Select value={draft.filial} onValueChange={(v) => setDraft({ ...draft, filial: v })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {filiais.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-caption">Status Estoque</Label>
                  <Select value={draft.stockStatus} onValueChange={(v) => setDraft({ ...draft, stockStatus: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Normal ✓</SelectItem>
                      <SelectItem value="low">Baixo ⚠</SelectItem>
                      <SelectItem value="critical">Crítico 🟠</SelectItem>
                      <SelectItem value="out_of_stock">Esgotado 🔴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              <div className="space-y-1">
                <Label className="text-caption">Faixa de Preço (R$)</Label>
                <div className="flex gap-2">
                  <Input type="number" min="0" placeholder="Mín" value={draft.priceMin}
                    onChange={(e) => { setDraft({ ...draft, priceMin: e.target.value }); setPriceError(""); }} className="h-8 text-sm" />
                  <Input type="number" min="0" placeholder="Máx" value={draft.priceMax}
                    onChange={(e) => { setDraft({ ...draft, priceMax: e.target.value }); setPriceError(""); }} className="h-8 text-sm" />
                </div>
                {priceError && <p className="text-[11px] text-destructive">{priceError}</p>}
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 p-4 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1 h-8" onClick={handleClear}>Limpar Filtros</Button>
            <Button size="sm" className="flex-1 h-8" onClick={handleApply}>Aplicar Filtros</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
}
