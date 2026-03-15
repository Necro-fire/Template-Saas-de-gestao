import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockClients } from "@/data/mockData";

export default function Clientes() {
  const [search, setSearch] = useState("");

  const filtered = mockClients.filter(c =>
    !search ||
    c.storeName.toLowerCase().includes(search.toLowerCase()) ||
    c.responsibleName.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search)
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Clientes</h1>
          <p className="text-ui text-muted-foreground">{mockClients.length} clientes cadastrados</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, ótica ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="space-y-1">
        {filtered.map(client => (
          <div key={client.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
            <div>
              <p className="text-ui font-medium">{client.storeName}</p>
              <p className="text-caption text-muted-foreground">{client.responsibleName} · {client.cnpj}</p>
              <p className="text-caption text-muted-foreground">{client.city}/{client.state} · {client.whatsapp}</p>
            </div>
            <div className="text-right">
              <Badge variant={client.status === "active" ? "secondary" : "outline"} className="text-caption">
                {client.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <p className="text-caption text-muted-foreground mt-1 tabular-nums">Limite: R$ {client.creditLimit.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
