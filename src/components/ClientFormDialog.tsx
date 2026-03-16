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

interface ClientData {
  id?: string;
  responsible_name: string;
  store_name: string;
  tipo_cliente: string;
  cnpj: string;
  phone: string;
  email: string;
  endereco: string;
  data_nascimento: string;
  observacoes: string;
  filial_id: string;
}

const emptyClient: ClientData = {
  responsible_name: "",
  store_name: "",
  tipo_cliente: "pf",
  cnpj: "",
  phone: "",
  email: "",
  endereco: "",
  data_nascimento: "",
  observacoes: "",
  filial_id: "1",
};

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient?: ClientData | null;
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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

  const handleChange = (field: keyof ClientData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocChange = (value: string) => {
    const formatted = form.tipo_cliente === "pf" ? formatCpf(value) : formatCnpj(value);
    handleChange("cnpj", formatted);
  };

  const handleSave = async () => {
    if (!form.responsible_name.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Informe o telefone");
      return;
    }
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
        phone: form.phone.trim(),
        whatsapp: form.phone.trim(),
        email: form.email.trim(),
        endereco: form.endereco.trim(),
        data_nascimento: form.data_nascimento || null,
        observacoes: form.observacoes.trim(),
        filial_id: form.filial_id,
      };

      if (isEditing) {
        const { error } = await (supabase as any)
          .from("clientes")
          .update(payload)
          .eq("id", editingClient!.id);
        if (error) throw error;
        toast.success("Cliente atualizado!");
      } else {
        const { error } = await (supabase as any)
          .from("clientes")
          .insert(payload);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Nome */}
          <div>
            <Label htmlFor="client-name">Nome / Razão Social *</Label>
            <Input
              id="client-name"
              value={form.responsible_name}
              onChange={(e) => handleChange("responsible_name", e.target.value)}
              placeholder="Nome completo ou razão social"
              className="mt-1.5"
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="client-phone">Telefone *</Label>
            <Input
              id="client-phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className="mt-1.5"
            />
          </div>

          {/* Tipo de cliente + CPF/CNPJ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de cliente *</Label>
              <Select
                value={form.tipo_cliente}
                onValueChange={(v) => {
                  handleChange("tipo_cliente", v);
                  handleChange("cnpj", "");
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pf">Pessoa Física</SelectItem>
                  <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-doc">
                {form.tipo_cliente === "pf" ? "CPF *" : "CNPJ *"}
              </Label>
              <Input
                id="client-doc"
                value={form.cnpj}
                onChange={(e) => handleDocChange(e.target.value)}
                placeholder={form.tipo_cliente === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              className="mt-1.5"
            />
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="client-address">Endereço</Label>
            <Input
              id="client-address"
              value={form.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className="mt-1.5"
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <Label htmlFor="client-birth">Data de nascimento</Label>
            <Input
              id="client-birth"
              type="date"
              value={form.data_nascimento}
              onChange={(e) => handleChange("data_nascimento", e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Filial */}
          <div>
            <Label>Filial *</Label>
            <Select value={form.filial_id} onValueChange={(v) => handleChange("filial_id", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Filial 1</SelectItem>
                <SelectItem value="2">Filial 2</SelectItem>
                <SelectItem value="3">Filial 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="client-obs">Observações</Label>
            <Textarea
              id="client-obs"
              value={form.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Anotações sobre o cliente"
              className="mt-1.5 min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
