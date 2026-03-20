import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useEmpresas, type DbEmpresa } from "@/hooks/useEmpresas";

export type FilialId = string; // "1" | "2" | "3" | "all" or dynamic

export interface Filial {
  id: FilialId;
  name: string;
  empresa?: DbEmpresa;
}

// Fallback for when no empresas are loaded yet
const defaultFiliais: Filial[] = [
  { id: "1", name: "Filial 1" },
  { id: "2", name: "Filial 2" },
  { id: "3", name: "Filial 3" },
];

interface FilialContextType {
  selectedFilial: FilialId;
  setSelectedFilial: (id: FilialId) => void;
  filterByFilial: <T extends { filialId: string }>(items: T[]) => T[];
  filialLabel: string;
  filiais: Filial[];
  empresas: DbEmpresa[];
  getEmpresaByFilial: (filialId: FilialId) => DbEmpresa | undefined;
}

const FilialContext = createContext<FilialContextType | null>(null);

export function FilialProvider({ children }: { children: ReactNode }) {
  const { data: empresas } = useEmpresas();
  const [selectedFilial, setSelectedFilial] = useState<FilialId>("all");

  // Build filiais from empresas data
  const filiais: Filial[] = empresas.length > 0
    ? empresas
        .filter(e => e.ativa)
        .map(e => ({
          id: e.filial_id || e.id,
          name: e.nome_fantasia || e.razao_social,
          empresa: e,
        }))
    : defaultFiliais;

  const filterByFilial = <T extends { filialId: string }>(items: T[]): T[] => {
    if (selectedFilial === "all") return items;
    return items.filter(item => item.filialId === selectedFilial);
  };

  const filialLabel = selectedFilial === "all"
    ? "Todas as Filiais"
    : filiais.find(f => f.id === selectedFilial)?.name || `Filial ${selectedFilial}`;

  const getEmpresaByFilial = (filialId: FilialId): DbEmpresa | undefined => {
    return empresas.find(e => e.filial_id === filialId);
  };

  return (
    <FilialContext.Provider value={{ 
      selectedFilial, setSelectedFilial, filterByFilial, filialLabel, 
      filiais, empresas, getEmpresaByFilial 
    }}>
      {children}
    </FilialContext.Provider>
  );
}

export function useFilial() {
  const ctx = useContext(FilialContext);
  if (!ctx) throw new Error("useFilial must be used within FilialProvider");
  return ctx;
}
