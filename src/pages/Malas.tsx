import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

export default function Malas() {
  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Malas</h1>
            <p className="text-ui text-muted-foreground">Controle de malas dos representantes</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nova Mala
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Briefcase className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-ui font-medium">Nenhuma mala encontrada</p>
          <p className="text-caption mt-1">Crie sua primeira mala para começar</p>
        </div>
      </div>
    </div>
  );
}
