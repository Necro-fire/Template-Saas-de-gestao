import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TipoProduto {
  id: string;
  nome_tipo: string;
  estoque_minimo_alerta: number;
  created_at: string;
}

export function useProductTypes() {
  const [data, setData] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows, error } = await (supabase as any).from("tipos_produto").select("*").order("nome_tipo");
    if (!error && rows) setData(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("tipos_produto-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tipos_produto" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { data, loading, refetch: fetch };
}
