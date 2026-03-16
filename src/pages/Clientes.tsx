import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { filiais } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useClients } from "@/hooks/useSupabaseData";
import { useFilial } from "@/contexts/FilialContext";

export default function Clientes() {
  const [search, setSearch] = useState("");
  const { selectedFilial } = useFilial();
  const { data: clients } = useClients();

  const filtered = clients.filter(c =>
    !search ||
    c.store_name.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible_name.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search)
  );

  const getFilialName = (filialId: string) => filiais.find(f => f.id === filialId)?.name || filialId;

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Clientes</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} clientes</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {clients.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, ótica ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-1">
            {filtered.map(client => (
              <div key={client.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-ui font-medium">{client.store_name}</p>
                  <p className="text-caption text-muted-foreground">{client.responsible_name} · {client.cnpj}</p>
                  <p className="text-caption text-muted-foreground">{client.city}/{client.state} · {client.whatsapp}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  {selectedFilial === "all" && (
                    <Badge variant="outline" className="text-caption">{getFilialName(client.filial_id)}</Badge>
                  )}
                  <div>
                    <Badge variant={client.status === "active" ? "secondary" : "outline"} className="text-caption">
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <p className="text-caption text-muted-foreground mt-1 tabular-nums">Limite: R$ {Number(client.credit_limit).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhum cliente cadastrado</p>
            <p className="text-caption mt-1">Cadastre seu primeiro cliente para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
