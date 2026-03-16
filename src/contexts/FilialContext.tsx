import { createContext, useContext, useState, type ReactNode } from "react";

export type FilialId = "1" | "2" | "3" | "all";

export interface Filial {
  id: FilialId;
  name: string;
}

export const filiais: Filial[] = [
  { id: "1", name: "Filial 1" },
  { id: "2", name: "Filial 2" },
  { id: "3", name: "Filial 3" },
];

interface FilialContextType {
  selectedFilial: FilialId;
  setSelectedFilial: (id: FilialId) => void;
  filterByFilial: <T extends { filialId: string }>(items: T[]) => T[];
  filialLabel: string;
}

const FilialContext = createContext<FilialContextType | null>(null);

export function FilialProvider({ children }: { children: ReactNode }) {
  const [selectedFilial, setSelectedFilial] = useState<FilialId>("all");

  const filterByFilial = <T extends { filialId: string }>(items: T[]): T[] => {
    if (selectedFilial === "all") return items;
    return items.filter(item => item.filialId === selectedFilial);
  };

  const filialLabel = selectedFilial === "all"
    ? "Todas as Filiais"
    : `Filial ${selectedFilial}`;

  return (
    <FilialContext.Provider value={{ selectedFilial, setSelectedFilial, filterByFilial, filialLabel }}>
      {children}
    </FilialContext.Provider>
  );
}

export function useFilial() {
  const ctx = useContext(FilialContext);
  if (!ctx) throw new Error("useFilial must be used within FilialProvider");
  return ctx;
}
