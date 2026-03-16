import { useState } from "react";
import { Search, Plus, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEmployees } from "@/data/mockData";
import { useFilial, filiais } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

export default function Funcionarios() {
  const [search, setSearch] = useState("");
  const { filterByFilial, selectedFilial } = useFilial();

  const filtered = filterByFilial(mockEmployees).filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const getFilialName = (filialId: string) => filiais.find(f => f.id === filialId)?.name || filialId;

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Funcionários</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} funcionários</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Funcionário
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou cargo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        <div className="space-y-1">
          {filtered.map(emp => (
            <div key={emp.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <UserCog className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-ui font-medium">{emp.name}</p>
                  <p className="text-caption text-muted-foreground">{emp.role} · {emp.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedFilial === "all" && (
                  <Badge variant="outline" className="text-caption">{getFilialName(emp.filialId)}</Badge>
                )}
                <Badge variant={emp.status === "active" ? "secondary" : "outline"} className="text-caption">
                  {emp.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-ui">Nenhum funcionário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
