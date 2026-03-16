import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TipoProduto {
  id: string;
  nome_tipo: string;
  created_at: string;
}

interface ProductTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductTypesDialog({ open, onOpenChange }: ProductTypesDialogProps) {
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingTipo, setDeletingTipo] = useState<TipoProduto | null>(null);

  const fetchTipos = async () => {
    const { data, error } = await (supabase as any).from("tipos_produto").select("*").order("nome_tipo");
    if (!error && data) setTipos(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchTipos();
  }, [open]);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (tipos.some(t => t.nome_tipo.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Esse tipo já existe");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("tipos_produto").insert({ nome_tipo: trimmed });
    if (error) {
      toast.error(error.message.includes("unique") ? "Tipo duplicado" : "Erro ao salvar");
    } else {
      toast.success("Tipo adicionado");
      setNewName("");
      fetchTipos();
    }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    if (tipos.some(t => t.id !== id && t.nome_tipo.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Esse tipo já existe");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("tipos_produto").update({ nome_tipo: trimmed }).eq("id", id);
    if (error) {
      toast.error("Erro ao editar");
    } else {
      toast.success("Tipo atualizado");
      setEditingId(null);
      fetchTipos();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingTipo) return;
    // Check if type is in use
    const { data: used } = await (supabase as any)
      .from("produtos")
      .select("id")
      .eq("tipo_produto_id", deletingTipo.id)
      .limit(1);
    if (used && used.length > 0) {
      toast.error("Este tipo está sendo usado por produtos e não pode ser excluído");
      setDeletingTipo(null);
      return;
    }
    const { error } = await (supabase as any).from("tipos_produto").delete().eq("id", deletingTipo.id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Tipo excluído");
      fetchTipos();
    }
    setDeletingTipo(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tipos de Produto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do novo tipo..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="h-9"
              />
              <Button size="sm" className="gap-1 h-9 shrink-0" onClick={handleAdd} disabled={saving || !newName.trim()}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Adicionar
              </Button>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tipos.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">Nenhum tipo cadastrado</p>
              ) : (
                tipos.map(tipo => (
                  <div key={tipo.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 group">
                    {editingId === tipo.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(tipo.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="h-8 flex-1"
                          autoFocus
                        />
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingId(null)}>Cancelar</Button>
                        <Button size="sm" className="h-8" onClick={() => handleEdit(tipo.id)} disabled={saving}>Salvar</Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{tipo.nome_tipo}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          onClick={() => { setEditingId(tipo.id); setEditName(tipo.nome_tipo); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => setDeletingTipo(tipo)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTipo} onOpenChange={(o) => !o && setDeletingTipo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo?</AlertDialogTitle>
            <AlertDialogDescription>
              O tipo "{deletingTipo?.nome_tipo}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
