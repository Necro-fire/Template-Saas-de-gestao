import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";
import { useVendas } from "@/hooks/useSupabaseData";

export default function Vendas() {
  const { data: sales } = useVendas();
  const { empresas } = useFilial();

  const getFilialName = (filialId: string) => {
    const emp = empresas.find(e => e.id === filialId);
    return emp?.nome_fantasia || filialId;
  };

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Vendas</h1>
          <p className="text-ui text-muted-foreground">{sales.length} vendas</p>
        </div>

        {sales.length > 0 ? (
          <div className="space-y-1">
            {sales.map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-ui font-medium">Venda #{sale.number}</p>
                    <p className="text-caption text-muted-foreground">{sale.client_name}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <Badge variant="outline" className="text-caption">{getFilialName(sale.filial_id)}</Badge>
                  <Badge variant="secondary" className="text-caption">{sale.origin === "bag" ? "Mala" : "Estoque"}</Badge>
                  <div>
                    <p className="text-ui font-medium tabular-nums text-primary">R$ {Number(sale.total).toFixed(2)}</p>
                    <p className="text-caption text-muted-foreground">{sale.payment_method} · {new Date(sale.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhuma venda registrada</p>
            <p className="text-caption mt-1">As vendas realizadas aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
