import { useState, useMemo, useCallback } from "react";
import { Plus, Package, Pencil, Trash2, ShoppingCart, Printer } from "lucide-react";
import JsBarcode from "jsbarcode";
import { useAuth } from "@/contexts/AuthContext";
import { AtacadoDialog } from "@/components/AtacadoDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useProducts, type DbProduct } from "@/hooks/useSupabaseData";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { ProductFilters, useProductFilters, applyProductFilters, getStockLevel } from "@/components/ProductFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Produtos() {
  const [showForm, setShowForm] = useState(false);
  const [showAtacado, setShowAtacado] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);
  const { selectedFilial, filiais } = useFilial();
  const { filters, setFilters } = useProductFilters();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('produtos', 'create');
  const canEdit = hasPermission('produtos', 'edit');
  const canDelete = hasPermission('produtos', 'delete');

  const { data: products } = useProducts();

  const getFilialName = (filialId: string) => filiais.find(f => f.id === filialId)?.name || filialId;

  const filtered = useMemo(() => applyProductFilters(products, filters), [products, filters]);

  const [deleteCheck, setDeleteCheck] = useState<{ canDelete: boolean; reason?: string } | null>(null);

  const checkAndDelete = async (product: DbProduct) => {
    setDeletingProduct(product);
    // Check sales
    const { count: salesCount } = await (supabase as any)
      .from("venda_items")
      .select("id", { count: "exact", head: true })
      .eq("produto_id", product.id);
    if (salesCount && salesCount > 0) {
      setDeleteCheck({ canDelete: false, reason: "Este produto já possui vendas registradas e não pode ser excluído." });
      return;
    }
    // Check stock
    const { data: estoque } = await (supabase as any)
      .from("estoque")
      .select("quantidade")
      .eq("produto_id", product.id);
    const totalStock = (estoque || []).reduce((sum: number, e: any) => sum + (e.quantidade || 0), 0);
    if (totalStock > 0) {
      setDeleteCheck({ canDelete: false, reason: "Não é possível excluir um produto com estoque disponível." });
      return;
    }
    setDeleteCheck({ canDelete: true });
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    const { error } = await (supabase as any).from("produtos").delete().eq("id", deletingProduct.id);
    if (error) { toast.error("Erro ao excluir produto"); } else { toast.success("Produto excluído"); }
    setDeletingProduct(null);
    setDeleteCheck(null);
  };

  const handleInactivate = async () => {
    if (!deletingProduct) return;
    const { error } = await (supabase as any).from("produtos").update({ status: "inativo" }).eq("id", deletingProduct.id);
    if (error) { toast.error("Erro ao inativar produto"); } else { toast.success("Produto inativado com sucesso"); }
    setDeletingProduct(null);
    setDeleteCheck(null);
  };

  const handleEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = (open: boolean) => {
    setShowForm(open);
    if (!open) setEditingProduct(null);
  };

  const handlePrintLabel = useCallback((product: DbProduct) => {
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, product.barcode || product.code, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 10,
        margin: 2,
      });
    } catch {
      toast.error("Código de barras inválido");
      return;
    }
    const barcodeDataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "width=400,height=200");
    if (!printWindow) { toast.error("Popup bloqueado"); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Etiqueta</title><style>
      @page { size: 95mm 12mm; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: 95mm; height: 12mm; display: flex; align-items: center; }
      img { height: 10mm; width: auto; margin-left: 1mm; }
    </style></head><body>
      <img src="${barcodeDataUrl}" />
    </body></html>`);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  }, []);

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Produtos</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} produtos</p>
          </div>
          <div className="flex gap-2">
            {canCreate && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAtacado(true)}>
                <ShoppingCart className="h-4 w-4" />
                Atacado
              </Button>
            )}
            {canCreate && (
              <Button size="sm" className="gap-1.5" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            )}
          </div>
        </div>

        {products.length > 0 && <ProductFilters filters={filters} onChange={setFilters} />}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => {
              return (
                <div key={product.id} className="rounded-lg shadow-card bg-card p-3 group hover:shadow-md transition-shadow relative">
                  {(canEdit || canDelete) && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => handleEdit(product)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => checkAndDelete(product)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="aspect-[3/2] rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.model} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground/30 text-title font-bold">{product.referencia}</span>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-ui font-semibold truncate">
                        {product.referencia}
                        {(product as any).classificacao && <span className="ml-1 text-primary">({(product as any).classificacao})</span>}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground/60">{product.barcode}</p>
                      {!(product as any).is_acessorio && (product.cor_armacao || product.color) && (
                        <p className="text-caption text-muted-foreground">
                          {product.cor_armacao || product.color}
                          {product.material_aro && ` · ${product.material_aro}`}
                        </p>
                      )}
                      {(product as any).is_acessorio && (product as any).subcategoria_acessorio && (
                        <p className="text-caption text-muted-foreground">{(product as any).subcategoria_acessorio}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(product as any).estilo && <Badge variant="outline" className="text-caption">{(product as any).estilo}</Badge>}
                        {(product as any).categoria_idade && <Badge variant="outline" className="text-caption">{(product as any).categoria_idade}</Badge>}
                        {(product as any).genero && <Badge variant="outline" className="text-caption">{(product as any).genero}</Badge>}
                        
                        {(product as any).is_acessorio && <Badge variant="secondary" className="text-caption">Acessório</Badge>}
                      </div>
                      {selectedFilial === "all" && (
                        <p className="text-caption text-primary">{getFilialName(product.filial_id)}</p>
                      )}
                    </div>
                    <span className="text-ui font-medium tabular-nums text-primary whitespace-nowrap">
                      R$ {Number(product.retail_price)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {!(product as any).is_acessorio ? (
                      <div className="flex gap-2 text-caption font-mono text-muted-foreground">
                        <span>{product.lens_size}mm</span>
                        <span>□</span>
                        <span>{product.bridge_size}mm</span>
                        <span>—</span>
                        <span>{product.temple_size}mm</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    {(() => {
                      const level = getStockLevel(product.stock, 0);
                      return (
                        <Badge
                          variant={level === "out_of_stock" ? "destructive" : level === "critical" || level === "low" ? "outline" : "secondary"}
                          className={`text-caption tabular-nums ${level === "critical" ? "border-orange-500 text-orange-600" : level === "low" ? "border-warning text-warning" : ""}`}
                        >
                          {product.stock} un.
                          {level === "low" && " ⚠"}
                          {level === "critical" && " 🟠"}
                        </Badge>
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-1"
                      title="Imprimir etiqueta"
                      onClick={(e) => { e.stopPropagation(); handlePrintLabel(product); }}
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhum produto encontrado</p>
            <p className="text-caption mt-1">Tente ajustar os filtros ou cadastre um novo produto</p>
          </div>
        )}

        <ProductFormDialog open={showForm} onOpenChange={handleFormClose} product={editingProduct} />
        <AtacadoDialog open={showAtacado} onOpenChange={setShowAtacado} />
        

        <AlertDialog open={!!deletingProduct} onOpenChange={(o) => { if (!o) { setDeletingProduct(null); setDeleteCheck(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteCheck?.canDelete === false ? "Não é possível excluir" : "Excluir produto?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteCheck === null
                  ? "Verificando dependências..."
                  : deleteCheck.canDelete
                    ? `O produto "${deletingProduct?.referencia}" será removido permanentemente.`
                    : deleteCheck.reason}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              {deleteCheck?.canDelete === false ? (
                <AlertDialogAction onClick={handleInactivate} className="bg-amber-600 text-white hover:bg-amber-700">
                  Inativar Produto
                </AlertDialogAction>
              ) : deleteCheck?.canDelete ? (
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              ) : null}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
