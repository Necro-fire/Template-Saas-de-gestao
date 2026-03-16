import { useMemo } from "react";
import { Package, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { filiais } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts } from "@/hooks/useSupabaseData";
import { useFilial } from "@/contexts/FilialContext";
import { useProductTypes } from "@/hooks/useProductTypes";
import { ProductFilters, useProductFilters, applyProductFilters } from "@/components/ProductFilters";

export default function Estoque() {
  const { selectedFilial } = useFilial();
  const { data: products } = useProducts();
  const { data: tipos } = useProductTypes();
  const { filters, setFilters } = useProductFilters();

  const filtered = useMemo(() => applyProductFilters(products, filters), [products, filters]);

  const totalStock = filtered.reduce((acc, p) => acc + p.stock, 0);
  const lowStock = filtered.filter(p => p.stock <= p.min_stock && p.stock > 0).length;
  const outOfStock = filtered.filter(p => p.stock === 0).length;

  const getTypeName = (id: string | null) => {
    if (!id) return null;
    return tipos.find(t => t.id === id)?.nome_tipo || null;
  };

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Estoque</h1>
          <p className="text-ui text-muted-foreground">Controle de estoque · {filtered.length} produtos</p>
        </div>

        {products.length > 0 && <ProductFilters filters={filters} onChange={setFilters} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Total em Estoque</p>
                <p className="text-title font-semibold tabular-nums">{totalStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-warning/10 flex items-center justify-center">
                <ArrowDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Estoque Baixo</p>
                <p className="text-title font-semibold tabular-nums">{lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-destructive/10 flex items-center justify-center">
                <ArrowDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Sem Estoque</p>
                <p className="text-title font-semibold tabular-nums">{outOfStock}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-ui font-semibold">Inventário</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {filtered.length > 0 ? (
              <div className="space-y-1">
                {filtered.map(p => {
                  const typeName = getTypeName((p as any).tipo_produto_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-caption text-muted-foreground font-mono w-16">{p.code}</span>
                        <div>
                          <p className="text-ui font-medium">{p.model}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-caption text-muted-foreground">{p.color} · {p.material}</p>
                            {typeName && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{typeName}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedFilial === "all" && (
                          <Badge variant="outline" className="text-caption">{filiais.find(f => f.id === p.filial_id)?.name}</Badge>
                        )}
                        <Badge
                          variant={p.stock === 0 ? "destructive" : p.stock <= p.min_stock ? "outline" : "secondary"}
                          className="tabular-nums text-caption"
                        >
                          {p.stock} un.
                        </Badge>
                        <span className="text-caption text-muted-foreground tabular-nums">mín: {p.min_stock}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-ui font-medium">Nenhum produto encontrado</p>
                <p className="text-caption mt-1">Tente ajustar os filtros</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
