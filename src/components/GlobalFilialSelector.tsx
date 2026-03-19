import { Building2, ChevronDown } from "lucide-react";
import { useFilial } from "@/contexts/FilialContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalFilialSelector() {
  const { selectedFilial, setSelectedFilial, empresas, filialLabel } = useFilial();

  if (empresas.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-medium">
          <Building2 className="h-3.5 w-3.5" />
          <span className="max-w-[140px] truncate">{filialLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {empresas.map((empresa, i) => (
          <DropdownMenuItem
            key={empresa.id}
            onClick={() => setSelectedFilial(empresa.id)}
            className={cn(
              "gap-2 text-xs",
              selectedFilial === empresa.id && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            {empresa.nome_fantasia || `Filial ${i + 1}`}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setSelectedFilial("all")}
          className={cn(
            "gap-2 text-xs",
            selectedFilial === "all" && "bg-primary/10 text-primary font-medium"
          )}
        >
          <Building2 className="h-3.5 w-3.5" />
          Todas as Filiais
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
