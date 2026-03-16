import { BarChart3, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

const reports = [
  { title: "Vendas por Período", desc: "Relatório de vendas com filtro por data" },
  { title: "Vendas por Vendedor", desc: "Performance de cada vendedor" },
  { title: "Vendas por Cliente", desc: "Histórico de compras por cliente" },
  { title: "Produtos Mais Vendidos", desc: "Ranking de produtos por volume" },
  { title: "Produtos Sem Giro", desc: "Produtos sem movimentação" },
  { title: "Estoque Atual", desc: "Posição de estoque completa" },
  { title: "Relatório de Mala", desc: "Controle de mala por vendedor" },
  { title: "Fluxo de Caixa", desc: "Entradas e saídas por período" },
];

export default function Relatorios() {
  const { filialLabel } = useFilial();

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title font-semibold tracking-tighter">Relatórios</h1>
          <p className="text-ui text-muted-foreground">Geração de relatórios — {filialLabel}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((report, i) => (
            <Card key={i} className="shadow-card hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-ui font-semibold">{report.title}</h3>
                    <p className="text-caption text-muted-foreground mt-1">{report.desc}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
