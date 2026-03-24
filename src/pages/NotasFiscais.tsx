import { useState } from "react";
import { FileText, Download, X, Send, Search, Filter, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FilialSelector } from "@/components/FilialSelector";
import { useFilial } from "@/contexts/FilialContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotasFiscais, type DbNotaFiscal } from "@/hooks/useNotasFiscais";
import { useEmpresas } from "@/hooks/useEmpresas";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary"; className: string }> = {
  autorizada: { label: "Autorizada", variant: "default", className: "bg-success text-success-foreground" },
  cancelada: { label: "Cancelada", variant: "destructive", className: "" },
  pendente: { label: "Pendente", variant: "secondary", className: "bg-warning text-warning-foreground" },
  rejeitada: { label: "Rejeitada", variant: "destructive", className: "" },
};

export default function NotasFiscais() {
  const { selectedFilial, filiais } = useFilial();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('fiscal', 'manage');
  const { data: notas, updateStatus } = useNotasFiscais();
  const { data: empresas } = useEmpresas();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNF, setSelectedNF] = useState<DbNotaFiscal | null>(null);

  const filtered = notas.filter(nf => {
    const matchFilial = selectedFilial === "all" || nf.filial_id === selectedFilial;
    const matchSearch = !search || nf.client_name.toLowerCase().includes(search.toLowerCase()) || String(nf.numero).includes(search);
    const matchStatus = statusFilter === "all" || nf.status === statusFilter;
    return matchFilial && matchSearch && matchStatus;
  });

  const getFilialName = (filialId: string) => filiais.find(f => f.id === filialId)?.name || `Filial ${filialId}`;
  const getEmpresa = (empresaId: string | null) => empresaId ? empresas.find(e => e.id === empresaId) : null;

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

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "pendente", label: "Pendentes" },
            { key: "autorizada", label: "Autorizadas" },
            { key: "cancelada", label: "Canceladas" },
            { key: "rejeitada", label: "Rejeitadas" },
          ].map(s => {
            const count = notas.filter(nf =>
              nf.status === s.key && (selectedFilial === "all" || nf.filial_id === selectedFilial)
            ).length;
            return (
              <Card key={s.key} className="border-border/50">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold tabular-nums">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-1">
          {filtered.map(nf => {
            const st = statusMap[nf.status] || statusMap.pendente;
            return (
              <div
                key={nf.id}
                className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedNF(nf)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-ui font-medium">NF-e #{nf.numero}</p>
                    <p className="text-caption text-muted-foreground">
                      {nf.client_name} · {new Date(nf.data_emissao).toLocaleDateString("pt-BR")} · {getFilialName(nf.filial_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={st.className || undefined} variant={st.variant}>{st.label}</Badge>
                  <span className="text-ui font-medium tabular-nums text-primary">R$ {Number(nf.valor_total).toFixed(2)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedNF(nf); }} title="Ver detalhes">
                      <Eye className="h-3 w-3" />
                    </Button>
                    {canManage && nf.status === "pendente" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.info("Reenviando para SEFAZ..."); }} title="Reenviar">
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                    {canManage && nf.status === "autorizada" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleCancel(nf.id); }} title="Cancelar">
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedNF} onOpenChange={(o) => !o && setSelectedNF(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-ui">NF-e #{selectedNF?.numero}</DialogTitle>
          </DialogHeader>
          {selectedNF && (() => {
            const st = statusMap[selectedNF.status] || statusMap.pendente;
            const empresa = getEmpresa(selectedNF.empresa_id);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={st.className || undefined} variant={st.variant}>{st.label}</Badge>
                  <span className="text-ui font-medium tabular-nums">R$ {Number(selectedNF.valor_total).toFixed(2)}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-ui">
                  <div>
                    <p className="text-caption text-muted-foreground">Destinatário</p>
                    <p className="font-medium">{selectedNF.client_name}</p>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">CNPJ/CPF</p>
                    <p className="font-medium">{selectedNF.client_cnpj || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">{new Date(selectedNF.data_emissao).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Filial</p>
                    <p className="font-medium">{getFilialName(selectedNF.filial_id)}</p>
                  </div>
                </div>

                {empresa && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-caption text-muted-foreground mb-1">Emitente</p>
                      <p className="text-ui font-medium">{empresa.razao_social}</p>
                      <p className="text-caption text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                    </div>
                  </>
                )}

                {selectedNF.chave_acesso && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-caption text-muted-foreground mb-1">Chave de Acesso</p>
                      <p className="text-xs font-mono break-all">{selectedNF.chave_acesso}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => toast.info("Geração de DANFE em desenvolvimento")}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    DANFE (PDF)
                  </Button>
                  {canManage && selectedNF.status === "autorizada" && (
                    <Button variant="destructive" className="h-9" onClick={() => { handleCancel(selectedNF.id); setSelectedNF(null); }}>
                      <X className="h-3.5 w-3.5 mr-2" />
                      Cancelar NF
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
