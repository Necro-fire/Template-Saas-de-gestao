import { Building2 } from "lucide-react";
import { useFilial, filiais, type FilialId } from "@/contexts/FilialContext";
import { cn } from "@/lib/utils";

interface FilialSelectorProps {
  onBeforeChange?: (newFilial: FilialId) => boolean;
}

export function FilialSelector({ onBeforeChange }: FilialSelectorProps = {}) {
  const { selectedFilial, setSelectedFilial } = useFilial();

  const options: { id: FilialId; label: string }[] = [
    ...filiais.map(f => ({ id: f.id, label: f.name })),
    { id: "all" as FilialId, label: "Todas" },
  ];

  const handleClick = (id: FilialId) => {
    if (id === selectedFilial) return;
    if (onBeforeChange && !onBeforeChange(id)) return;
    setSelectedFilial(id);
  };

  return (
    <div className="px-4 pt-4 pb-0">
      <div className="grid grid-cols-4 bg-secondary/50 rounded-lg p-0.5 w-full">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleClick(opt.id)}
            className={cn(
              "py-2 rounded-md text-caption font-medium transition-all text-center",
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
