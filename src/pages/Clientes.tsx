import { useState, useMemo } from "react";
import { Search, Plus, Users, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { filiais, useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useClients } from "@/hooks/useSupabaseData";
import { ClientFormDialog } from "@/components/ClientFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { selectedFilial } = useFilial();
  const { data: clients, refetch } = useClients();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        !search ||
        c.responsible_name.toLowerCase().includes(q) ||
        c.cnpj.includes(search) ||
        c.phone.includes(search)
    );
  }, [clients, search]);

  const getFilialName = (filialId: string) =>
    filiais.find((f) => f.id === filialId)?.name || filialId;

  const handleEdit = (client: any) => {
    setEditingClient({
      id: client.id,
      responsible_name: client.responsible_name,
      store_name: client.store_name,
      tipo_cliente: client.tipo_cliente || "pf",
      cnpj: client.cnpj,
      inscricao_estadual: client.inscricao_estadual || "",
      phone: client.phone,
      email: client.email,
      cep: "",
      endereco: client.endereco || "",
      cidade: client.city || "",
      estado: client.state || "",
      data_nascimento: client.data_nascimento || "",
      observacoes: client.observacoes || "",
      filial_id: client.filial_id,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await (supabase as any)
      .from("clientes")
      .delete()
      .eq("id", deletingId);
    if (error) {
      toast.error("Erro ao excluir cliente");
    } else {
      toast.success("Cliente excluído");
      refetch();
    }
    setDeletingId(null);
  };

  const handleNew = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Clientes</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} clientes</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleNew}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {clients.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-1">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-ui font-medium">{client.responsible_name}</p>
                  <p className="text-caption text-muted-foreground">
                    {(client as any).tipo_cliente === "pj" ? "PJ" : "PF"} · {client.cnpj} · {client.phone}
                  </p>
                  {client.email && (
                    <p className="text-caption text-muted-foreground">{client.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedFilial === "all" && (
                    <Badge variant="outline" className="text-caption">
                      {getFilialName(client.filial_id)}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEdit(client)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => setDeletingId(client.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhum cliente cadastrado</p>
            <p className="text-caption mt-1">Cadastre seu primeiro cliente para começar</p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={handleNew}>
              <Plus className="h-4 w-4" />
              Adicionar Cliente
            </Button>
          </div>
        )}
      </div>

      <ClientFormDialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingClient(null);
        }}
        editingClient={editingClient}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
