import { Building2 } from "lucide-react";
import { useFilial, filiais, type FilialId } from "@/contexts/FilialContext";
import { cn } from "@/lib/utils";

export function FilialSelector() {
  const { selectedFilial, setSelectedFilial } = useFilial();

  const options: { id: FilialId; label: string }[] = [
    ...filiais.map(f => ({ id: f.id, label: f.name })),
    { id: "all" as FilialId, label: "Todas" },
  ];

  return (
    <div className="flex items-center gap-1 px-4 pt-4 pb-0">
      <Building2 className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilial(opt.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-caption font-medium transition-all",
              selectedFilial === opt.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
