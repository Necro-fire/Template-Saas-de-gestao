import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilial } from "@/contexts/FilialContext";

export interface DbProduct {
  id: string;
  code: string;
  model: string;
  color: string;
  material: string;
  lens_size: number;
  bridge_size: number;
  temple_size: number;
  category: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  wholesale_min_qty: number;
  stock: number;
  min_stock: number;
  status: string;
  image_url: string;
  filial_id: string;
  created_at: string;
}

export interface DbClient {
  id: string;
  responsible_name: string;
  store_name: string;
  cnpj: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  email: string;
  credit_limit: number;
  status: string;
  filial_id: string;
  created_at: string;
  tipo_cliente: string;
  endereco: string;
  data_nascimento: string | null;
  observacoes: string;
}

export interface DbVenda {
  id: string;
  number: number;
  client_id: string | null;
  client_name: string;
  seller_name: string;
  total: number;
  discount: number;
  payment_method: string;
  origin: string;
  filial_id: string;
  created_at: string;
}

export interface DbVendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  product_code: string;
  product_model: string;
  quantity: number;
  unit_price: number;
  total: number;
}

function useRealtimeTable<T>(table: string, filterFilial: boolean = true) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFilial } = useFilial();

  const fetchData = useCallback(async () => {
    let query = (supabase as any).from(table).select("*");
    if (filterFilial && selectedFilial !== "all") {
      query = query.eq("filial_id", selectedFilial);
    }
    const { data: rows, error } = await query;
    if (!error && rows) setData(rows as T[]);
    setLoading(false);
  }, [table, selectedFilial, filterFilial]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, table]);

  return { data, loading, refetch: fetchData };
}

export function useProducts() {
  return useRealtimeTable<DbProduct>("produtos");
}

export function useClients() {
  return useRealtimeTable<DbClient>("clientes");
}

export function useVendas() {
  return useRealtimeTable<DbVenda>("vendas");
}

export async function createVenda(
  items: { produto_id: string; product_code: string; product_model: string; quantity: number; unit_price: number }[],
  clientId: string | null,
  clientName: string,
  paymentMethod: string,
  origin: string,
  filialId: string,
  discount: number = 0
) {
  const total = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0) - discount;

  // Check stock availability
  for (const item of items) {
    const { data: product } = await (supabase as any)
      .from("produtos")
      .select("stock, model")
      .eq("id", item.produto_id)
      .single();
    
    if (!product || product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para ${product?.model || item.product_model}. Disponível: ${product?.stock ?? 0}`);
    }
  }

  const { data: venda, error: vendaError } = await (supabase as any)
    .from("vendas")
    .insert({
      client_id: clientId,
      client_name: clientName,
      seller_name: "",
      total,
      discount,
      payment_method: paymentMethod,
      origin,
      filial_id: filialId,
    })
    .select()
    .single();

  if (vendaError || !venda) throw new Error(vendaError?.message || "Erro ao criar venda");

  const vendaItems = items.map(i => ({
    venda_id: venda.id,
    produto_id: i.produto_id,
    product_code: i.product_code,
    product_model: i.product_model,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total: i.unit_price * i.quantity,
  }));

  const { error: itemsError } = await (supabase as any)
    .from("venda_items")
    .insert(vendaItems);

  if (itemsError) throw new Error(itemsError.message);

  return venda;
}
