import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Empresa {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  ativa: boolean;
  filial_padrao: boolean;
}

interface FilialContextType {
  selectedFilial: string;
  setSelectedFilial: (id: string) => void;
  empresas: Empresa[];
  loading: boolean;
  filialLabel: string;
  refetchEmpresas: () => void;
}

const FilialContext = createContext<FilialContextType | null>(null);

export function FilialProvider({ children }: { children: ReactNode }) {
  const [selectedFilial, setSelectedFilial] = useState<string>(() => {
    return localStorage.getItem("selectedFilial") || "all";
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("empresas")
      .select("id, nome_fantasia, razao_social, cnpj, ativa, filial_padrao")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setEmpresas(data);
      // If selected filial no longer exists and isn't "all", reset
      if (selectedFilial !== "all" && !data.find((e: Empresa) => e.id === selectedFilial)) {
        const padrao = data.find((e: Empresa) => e.filial_padrao);
        const newSel = padrao ? padrao.id : "all";
        setSelectedFilial(newSel);
        localStorage.setItem("selectedFilial", newSel);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmpresas();
    const channel = supabase
      .channel("empresas-filial")
      .on("postgres_changes", { event: "*", schema: "public", table: "empresas" }, () => fetchEmpresas())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchEmpresas]);

  useEffect(() => {
    localStorage.setItem("selectedFilial", selectedFilial);
  }, [selectedFilial]);

  const activeEmpresas = empresas.filter(e => e.ativa);

  const filialLabel = selectedFilial === "all"
    ? "Todas as Filiais"
    : activeEmpresas.find(e => e.id === selectedFilial)?.nome_fantasia || "Filial";

  return (
    <FilialContext.Provider value={{
      selectedFilial,
      setSelectedFilial,
      empresas: activeEmpresas,
      loading,
      filialLabel,
      refetchEmpresas: fetchEmpresas,
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

// Keep backward compat export
export type FilialId = string;
export const filiais: { id: string; name: string }[] = [];
