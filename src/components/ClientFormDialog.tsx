import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFilial } from "@/contexts/FilialContext";
import { maskCpf, maskCnpj, maskCelular, maskCep, ESTADOS_BR } from "@/lib/masks";

interface ClientData {
  id?: string;
  responsible_name: string;
  store_name: string;
  tipo_cliente: string;
  cnpj: string;
  inscricao_estadual: string;
  phone: string;
  email: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  data_nascimento: string;
  observacoes: string;
  filial_id: string;
}

const emptyClient: ClientData = {
  responsible_name: "",
  store_name: "",
  tipo_cliente: "pf",
  cnpj: "",
  inscricao_estadual: "",
  phone: "",
  email: "",
  cep: "",
  endereco: "",
  cidade: "",
  estado: "",
  data_nascimento: "",
  observacoes: "",
  filial_id: "1",
};

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient?: ClientData | null;
}

export function ClientFormDialog({ open, onOpenChange, editingClient }: ClientFormDialogProps) {
  const [form, setForm] = useState<ClientData>(emptyClient);
  const [saving, setSaving] = useState(false);
  const { selectedFilial } = useFilial();

  useEffect(() => {
    if (editingClient) {
      setForm(editingClient);
    } else {
      setForm({
        ...emptyClient,
        filial_id: selectedFilial !== "all" ? selectedFilial : "1",
      });
    }
  }, [editingClient, open, selectedFilial]);

  const isEditing = !!editingClient?.id;

  const set = (field: keyof ClientData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocChange = (value: string) => {
    const formatted = form.tipo_cliente === "pf" ? maskCpf(value) : maskCnpj(value);
    set("cnpj", formatted);
  };

  const handleSave = async () => {
    if (!form.responsible_name.trim()) { toast.error("Informe o nome do cliente"); return; }
    if (!form.phone.trim()) { toast.error("Informe o telefone"); return; }
    if (!form.cnpj.trim()) {
      toast.error(form.tipo_cliente === "pf" ? "Informe o CPF" : "Informe o CNPJ");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        responsible_name: form.responsible_name.trim(),
        store_name: form.responsible_name.trim(),
        tipo_cliente: form.tipo_cliente,
        cnpj: form.cnpj.trim(),
        inscricao_estadual: form.inscricao_estadual.trim(),
        phone: form.phone.trim(),
        whatsapp: form.phone.trim(),
        email: form.email.trim(),
        endereco: form.endereco.trim(),
        city: form.cidade.trim(),
        state: form.estado,
        data_nascimento: form.data_nascimento || null,
        observacoes: form.observacoes.trim(),
        filial_id: form.filial_id,
      };

      if (isEditing) {
        const { error } = await (supabase as any).from("clientes").update(payload).eq("id", editingClient!.id);
        if (error) throw error;
        toast.success("Cliente atualizado!");
      } else {
        const { error } = await (supabase as any).from("clientes").insert(payload);
        if (error) {
          if (error.message?.includes("clientes_cnpj_unique")) {
            toast.error("Já existe um cliente com este CPF/CNPJ");
            return;
          }
          throw error;
        }
        toast.success("Cliente cadastrado!");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome / Razão Social *</Label>
            <Input value={form.responsible_name} onChange={(e) => set("responsible_name", e.target.value)} placeholder="Nome completo ou razão social" className="mt-1.5" />
          </div>

          <div>
            <Label>Telefone / Celular *</Label>
            <Input value={form.phone} onChange={(e) => set("phone", maskCelular(e.target.value))} placeholder="(00) 0 0000-0000" className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo_cliente} onValueChange={(v) => { set("tipo_cliente", v); set("cnpj", ""); set("inscricao_estadual", ""); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pf">Pessoa Física</SelectItem>
                  <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.tipo_cliente === "pf" ? "CPF *" : "CNPJ *"}</Label>
              <Input value={form.cnpj} onChange={(e) => handleDocChange(e.target.value)} placeholder={form.tipo_cliente === "pf" ? "000.000.000-00" : "00.000.000/0000-00"} className="mt-1.5" />
            </div>
          </div>

          {form.tipo_cliente === "pj" && (
            <div>
              <Label>Inscrição Estadual</Label>
              <Input value={form.inscricao_estadual} onChange={(e) => set("inscricao_estadual", e.target.value)} placeholder="Opcional" className="mt-1.5" />
            </div>
          )}

          <div>
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" className="mt-1.5" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>CEP</Label>
              <Input value={form.cep || ""} onChange={(e) => set("cep" as any, maskCep(e.target.value))} placeholder="00000-000" className="mt-1.5" />
            </div>
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número, bairro" className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Estado (UF)</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Data de nascimento</Label>
            <Input type="date" value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Filial *</Label>
            <Select value={form.filial_id} onValueChange={(v) => set("filial_id", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Filial 1</SelectItem>
                <SelectItem value="2">Filial 2</SelectItem>
                <SelectItem value="3">Filial 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Anotações sobre o cliente" className="mt-1.5 min-h-[60px]" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
