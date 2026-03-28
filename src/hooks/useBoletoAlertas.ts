import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilial } from "@/contexts/FilialContext";

export interface BoletoAlerta {
  id: string;
  venda_id: string;
  filial_id: string;
  parcela_numero: number;
  total_parcelas: number;
  valor_parcela: number;
  data_vencimento: string;
  status: string;
  intervalo_dias: number;
  created_at: string;
  // joined
  venda_number?: number;
  client_name?: string;
}

export function useBoletoAlertas() {
  const [alertas, setAlertas] = useState<BoletoAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFilial } = useFilial();

  const fetchAlertas = useCallback(async () => {
    let query = (supabase as any)
      .from("boleto_alertas")
      .select("*, vendas(number, client_name)")
      .order("data_vencimento", { ascending: true });

    if (selectedFilial !== "all") {
      query = query.eq("filial_id", selectedFilial);
    }

    const { data, error } = await query;
    if (!error && data) {
      const mapped = (data as any[]).map((row) => ({
        ...row,
        venda_number: row.vendas?.number,
        client_name: row.vendas?.client_name || "Cliente avulso",
      }));
      setAlertas(mapped);
    }
    setLoading(false);
  }, [selectedFilial]);

  useEffect(() => {
    fetchAlertas();

    const channel = supabase
      .channel("boleto-alertas-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "boleto_alertas" }, () => {
        fetchAlertas();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAlertas]);

  const updateStatus = useCallback(async (alertaId: string, newStatus: string) => {
    const { error } = await (supabase as any)
      .from("boleto_alertas")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", alertaId);
    if (error) throw new Error(error.message);
  }, []);

  return { alertas, loading, refetch: fetchAlertas, updateStatus };
}

export async function createBoletoAlertas(
  vendaId: string,
  filialId: string,
  valorBoleto: number,
  totalParcelas: number,
  intervaloDias: number
) {
  const alertas = [];
  const now = new Date();

  for (let i = 1; i <= totalParcelas; i++) {
    const vencimento = new Date(now);
    vencimento.setDate(vencimento.getDate() + i * intervaloDias);

    alertas.push({
      venda_id: vendaId,
      filial_id: filialId,
      parcela_numero: i,
      total_parcelas: totalParcelas,
      valor_parcela: valorBoleto / totalParcelas,
      data_vencimento: vencimento.toISOString(),
      status: "pendente",
      intervalo_dias: intervaloDias,
    });
  }

  const { error } = await (supabase as any)
    .from("boleto_alertas")
    .insert(alertas);

  if (error) throw new Error(error.message);
}
