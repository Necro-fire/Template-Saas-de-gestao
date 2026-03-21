import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Percent, DollarSign, Package, Tag, Layers } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useFilial } from "@/contexts/FilialContext";
import { useDescontosAtacado, type DescontoAtacado } from "@/hooks/useDescontosAtacado";
import { useProducts } from "@/hooks/useSupabaseData";
import { ESTILOS } from "@/data/productConstants";
import { toast } from "sonner";

interface AtacadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = {
  tipo_desconto: "todas" as string,
  produto_id: "" as string,
  categoria: "" as string,
  quantidade_minima: 6,
  tipo_valor: "percentual" as string,
  valor_desconto: 0,
};

export function AtacadoDialog({ open, onOpenChange }: AtacadoDialogProps) {
  const { selectedFilial } = useFilial();
  const { data: descontos } = useDescontosAtacado();
  const { data: products } = useProducts();
  const { data: tipos } = useProductTypes();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedProducts = useMemo(
    () => [...products].filter(p => !(p as any).is_acessorio && p.status === "active").sort((a, b) => a.referencia.localeCompare(b.referencia, "pt-BR")),
    [products]
  );

  const sortedTipos = useMemo(
    () => [...tipos].sort((a, b) => a.nome_tipo.localeCompare(b.nome_tipo, "pt-BR")),
    [tipos]
  );

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (d: DescontoAtacado) => {
    setForm({
      tipo_desconto: d.tipo_desconto,
      produto_id: d.produto_id || "",
      categoria: d.categoria,
      quantidade_minima: d.quantidade_minima,
      tipo_valor: d.tipo_valor,
      valor_desconto: d.valor_desconto,
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (form.valor_desconto <= 0) { toast.error("Informe o valor do desconto"); return; }
    if (form.quantidade_minima < 1) { toast.error("Quantidade mínima deve ser pelo menos 1"); return; }
    if (form.tipo_desconto === "produto" && !form.produto_id) { toast.error("Selecione um produto"); return; }
    if (form.tipo_desconto === "categoria" && !form.categoria) { toast.error("Selecione uma categoria"); return; }
    if (form.tipo_valor === "percentual" && form.valor_desconto > 100) { toast.error("Percentual não pode exceder 100%"); return; }

    setSaving(true);
    const fId = selectedFilial === "all" ? "1" : selectedFilial;

    const payload = {
      tipo_desconto: form.tipo_desconto,
      produto_id: form.tipo_desconto === "produto" ? form.produto_id : null,
      categoria: form.tipo_desconto === "categoria" ? form.categoria : "",
      quantidade_minima: form.quantidade_minima,
      tipo_valor: form.tipo_valor,
      valor_desconto: form.valor_desconto,
      filial_id: fId,
      status: "active",
    };

    let error;
    if (editingId) {
      ({ error } = await (supabase as any).from("descontos_atacado").update(payload).eq("id", editingId));
    } else {
      ({ error } = await (supabase as any).from("descontos_atacado").insert(payload));
    }

    setSaving(false);
    if (error) { toast.error("Erro ao salvar desconto atacado"); return; }
    toast.success(editingId ? "Desconto atualizado" : "Desconto criado");
    resetForm();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await (supabase as any).from("descontos_atacado").delete().eq("id", deletingId);
    if (error) { toast.error("Erro ao remover desconto"); } else { toast.success("Desconto removido"); }
    setDeletingId(null);
  };

  const getProductRef = (id: string | null) => {
    if (!id) return "";
    const p = products.find(p => p.id === id);
    return p ? `${p.referencia}${(p as any).classificacao ? ` (${(p as any).classificacao})` : ""}` : id;
  };

  const getDescontoLabel = (d: DescontoAtacado) => {
    if (d.tipo_desconto === "produto") return getProductRef(d.produto_id);
    if (d.tipo_desconto === "categoria") return d.categoria;
    return "Todas as armações";
  };

  const getDescontoIcon = (tipo: string) => {
    if (tipo === "produto") return <Package className="h-4 w-4" />;
    if (tipo === "categoria") return <Tag className="h-4 w-4" />;
    return <Layers className="h-4 w-4" />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-title">Descontos Atacado</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add button */}
            {!showForm && (
              <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="h-4 w-4" />
                Novo Desconto
              </Button>
            )}

            {/* Form */}
            {showForm && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                <h3 className="text-ui font-semibold">{editingId ? "Editar Desconto" : "Novo Desconto"}</h3>

                {/* Tipo de desconto */}
                <div className="space-y-1.5">
                  <Label>Tipo de desconto</Label>
                  <Select value={form.tipo_desconto} onValueChange={v => setForm(f => ({ ...f, tipo_desconto: v, produto_id: "", categoria: "" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as armações</SelectItem>
                      <SelectItem value="categoria">Categoria (tipo de armação)</SelectItem>
                      <SelectItem value="produto">Produto específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Produto selector */}
                {form.tipo_desconto === "produto" && (
                  <div className="space-y-1.5">
                    <Label>Produto</Label>
                    <Select value={form.produto_id} onValueChange={v => setForm(f => ({ ...f, produto_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                      <SelectContent>
                        {sortedProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.referencia}{(p as any).classificacao ? ` (${(p as any).classificacao})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Categoria selector */}
                {form.tipo_desconto === "categoria" && (
                  <div className="space-y-1.5">
                    <Label>Categoria</Label>
                    <Select value={form.categoria} onValueChange={v => setForm(f => ({ ...f, categoria: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                      <SelectContent>
                        {sortedTipos.map(t => (
                          <SelectItem key={t.id} value={t.nome_tipo}>{t.nome_tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quantidade mínima + Tipo valor + Valor */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Qtd. mínima</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.quantidade_minima}
                      onChange={e => setForm(f => ({ ...f, quantidade_minima: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo de valor</Label>
                    <Select value={form.tipo_valor} onValueChange={v => setForm(f => ({ ...f, tipo_valor: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                        <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Valor do desconto</Label>
                    <Input
                      type="number"
                      min={0}
                      step={form.tipo_valor === "percentual" ? 1 : 0.01}
                      value={form.valor_desconto}
                      onChange={e => setForm(f => ({ ...f, valor_desconto: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {editingId ? "Salvar Alterações" : "Concluir Atacado"}
                  </Button>
                </div>
              </div>
            )}

            {/* List */}
            {descontos.length === 0 && !showForm ? (
              <p className="text-ui text-muted-foreground text-center py-8">Nenhum desconto de atacado cadastrado</p>
            ) : (
              <div className="space-y-2">
                {descontos.map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border bg-card p-3 group hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary shrink-0">
                        {getDescontoIcon(d.tipo_desconto)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-ui font-medium truncate">{getDescontoLabel(d)}</p>
                        <div className="flex items-center gap-2 text-caption text-muted-foreground">
                          <span>Mín. {d.quantidade_minima} un.</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            {d.tipo_valor === "percentual" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                            {d.tipo_valor === "percentual" ? `${d.valor_desconto}%` : `R$ ${Number(d.valor_desconto).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => startEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => setDeletingId(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={o => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover desconto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
