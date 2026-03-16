import { useState, useMemo } from "react";
import { Search, Filter, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFilial, filiais } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts } from "@/hooks/useSupabaseData";
import { ProductFormDialog } from "@/components/ProductFormDialog";

export default function Produtos() {
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const { selectedFilial } = useFilial();

  const { data: products } = useProducts();
  const materials = useMemo(() => [...new Set(products.map(p => p.material).filter(Boolean))], [products]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const getFilialName = (filialId: string) => filiais.find(f => f.id === filialId)?.name || filialId;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) || p.color.toLowerCase().includes(search.toLowerCase());
      const matchMaterial = materialFilter === "all" || p.material === materialFilter;
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchMaterial && matchCategory;
    });
  }, [search, materialFilter, categoryFilter, products]);

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Produtos</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} produtos</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {products.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por modelo, código ou cor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {materials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => (
              <div key={product.id} className="rounded-lg shadow-card bg-card p-3 group hover:shadow-md transition-shadow">
                <div className="aspect-[3/2] rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                  <span className="text-muted-foreground/30 text-title font-bold">{product.code}</span>
                </div>
                <div className="mt-3 flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-caption text-muted-foreground uppercase tracking-wider">{product.code}</p>
                    <h3 className="text-ui font-semibold truncate">{product.model}</h3>
                    <p className="text-caption text-muted-foreground">{product.color} · {product.material}</p>
                    {selectedFilial === "all" && (
                      <p className="text-caption text-primary">{getFilialName(product.filial_id)}</p>
                    )}
                  </div>
                  <span className="text-ui font-medium tabular-nums text-primary whitespace-nowrap">
                    R$ {Number(product.retail_price)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-2 text-caption font-mono text-muted-foreground">
                    <span>{product.lens_size}mm</span>
                    <span>□</span>
                    <span>{product.bridge_size}mm</span>
                    <span>—</span>
                    <span>{product.temple_size}mm</span>
                  </div>
                  <Badge
                    variant={product.stock === 0 ? "destructive" : product.stock <= product.min_stock ? "outline" : "secondary"}
                    className="text-caption tabular-nums"
                  >
                    {product.stock} un.
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhum produto cadastrado</p>
            <p className="text-caption mt-1">Cadastre seu primeiro produto para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
