import { useState } from "react";
import { FileText, Download, X, Send, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilialSelector } from "@/components/FilialSelector";
import { useFilial } from "@/contexts/FilialContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary"; className: string }> = {
  autorizada: { label: "Autorizada", variant: "default", className: "bg-success text-success-foreground" },
  cancelada: { label: "Cancelada", variant: "destructive", className: "" },
  pendente: { label: "Pendente", variant: "secondary", className: "bg-warning text-warning-foreground" },
  rejeitada: { label: "Rejeitada", variant: "destructive", className: "" },
};

export default function NotasFiscais() {
  const { selectedFilial } = useFilial();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('fiscal', 'manage');
  const { data: notas, updateStatus } = useNotasFiscais();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = notas.filter(nf => {
    const matchFilial = selectedFilial === "all" || nf.filial_id === selectedFilial;
    const matchSearch = !search || nf.client_name.toLowerCase().includes(search.toLowerCase()) || String(nf.numero).includes(search);
    const matchStatus = statusFilter === "all" || nf.status === statusFilter;
    return matchFilial && matchSearch && matchStatus;
  });

  const handleCancel = async (id: string) => {
    try {
      await updateStatus(id, "cancelada");
      toast.success("NF cancelada");
    } catch {
      toast.error("Erro ao cancelar NF");
    }
  };

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Notas Fiscais</h1>
          <p className="text-ui text-muted-foreground">Gestão de notas fiscais emitidas</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou número..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="autorizada">Autorizada</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
              <SelectItem value="rejeitada">Rejeitada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          {filtered.map(nf => {
            const st = statusMap[nf.status] || statusMap.pendente;
            return (
              <div key={nf.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-ui font-medium">NF-e #{nf.numero}</p>
                    <p className="text-caption text-muted-foreground">
                      {nf.client_name} · {new Date(nf.data_emissao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={st.className || undefined} variant={st.variant}>{st.label}</Badge>
                  <span className="text-ui font-medium tabular-nums text-primary">R$ {Number(nf.valor_total).toFixed(2)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("DANFE será gerado")} title="DANFE">
                      <Download className="h-3 w-3" />
                    </Button>
                    {nf.status === "pendente" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Reenviando para SEFAZ...")} title="Reenviar">
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                    {nf.status === "autorizada" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleCancel(nf.id)} title="Cancelar">
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-ui font-medium">Nenhuma nota encontrada</p>
              <p className="text-caption mt-1">As notas fiscais emitidas aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
