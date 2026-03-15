import { useState } from "react";
import { FileText, Download, X, Send, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockNotasFiscais } from "@/data/mockData";
import { toast } from "sonner";

const statusMap = {
  autorizada: { label: "Autorizada", variant: "default" as const, className: "bg-success text-success-foreground" },
  cancelada: { label: "Cancelada", variant: "destructive" as const, className: "" },
  pendente: { label: "Pendente", variant: "secondary" as const, className: "bg-warning text-warning-foreground" },
  rejeitada: { label: "Rejeitada", variant: "destructive" as const, className: "" },
};

export default function NotasFiscais() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockNotasFiscais.filter(nf => {
    const matchSearch = !search || nf.clientName.toLowerCase().includes(search.toLowerCase()) || String(nf.numero).includes(search);
    const matchStatus = statusFilter === "all" || nf.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
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
          const st = statusMap[nf.status];
          return (
            <div key={nf.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-ui font-medium">NF-e #{nf.numero}</p>
                  <p className="text-caption text-muted-foreground">{nf.clientName} · {nf.dataEmissao}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={st.className || undefined} variant={st.variant}>{st.label}</Badge>
                <span className="text-ui font-medium tabular-nums text-primary">R$ {nf.valorTotal.toFixed(2)}</span>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => toast.warning("Cancelamento solicitado")} title="Cancelar">
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-ui">Nenhuma nota encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
