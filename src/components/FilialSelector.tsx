import { useFilial } from "@/contexts/FilialContext";
import { cn } from "@/lib/utils";

interface FilialSelectorProps {
  onBeforeChange?: (newFilial: string) => boolean;
}

export function FilialSelector({ onBeforeChange }: FilialSelectorProps = {}) {
  const { selectedFilial, setSelectedFilial, empresas } = useFilial();

  const options = [
    ...empresas.map((e, i) => ({ id: e.id, label: e.nome_fantasia || `Filial ${i + 1}` })),
    { id: "all", label: "Todas" },
  ];

  if (empresas.length === 0) return null;

  const cols = options.length <= 2 ? "grid-cols-2" : options.length === 3 ? "grid-cols-3" : "grid-cols-4";

  const handleClick = (id: string) => {
    if (id === selectedFilial) return;
    if (onBeforeChange && !onBeforeChange(id)) return;
    setSelectedFilial(id);
  };

  return (
    <div className="px-4 pt-4 pb-0">
      <div className={cn("grid bg-secondary/50 rounded-lg p-0.5 w-full", cols)}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleClick(opt.id)}
            className={cn(
              "py-2 rounded-md text-caption font-medium transition-all text-center truncate px-1",
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
