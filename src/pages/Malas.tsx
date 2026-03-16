import { Briefcase, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilial } from "@/contexts/FilialContext";
import { FilialSelector } from "@/components/FilialSelector";

const mockBags = [
  {
    id: "1", code: "MALA-001", seller: "Pedro Vendas", status: "active" as const,
    totalItems: 45, soldItems: 12, withClient: 3, filialId: "1",
    items: [
      { code: "VF-001", model: "Aurora", qty: 8, sold: 3, withClient: 1 },
      { code: "VF-002", model: "Eclipse", qty: 6, sold: 2, withClient: 0 },
      { code: "VF-004", model: "Horizon", qty: 10, sold: 4, withClient: 2 },
    ],
  },
  {
    id: "2", code: "MALA-002", seller: "Ana Representante", status: "active" as const,
    totalItems: 30, soldItems: 8, withClient: 1, filialId: "2",
    items: [
      { code: "VF-003", model: "Zenith", qty: 5, sold: 2, withClient: 1 },
      { code: "VF-006", model: "Vortex", qty: 7, sold: 3, withClient: 0 },
    ],
  },
];

export default function Malas() {
  const { filterByFilial } = useFilial();
  const bags = filterByFilial(mockBags);

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Malas</h1>
            <p className="text-ui text-muted-foreground">Controle de malas dos representantes</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nova Mala
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bags.map(bag => (
            <Card key={bag.id} className="shadow-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <CardTitle className="text-ui font-semibold">{bag.code}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-caption">{bag.status === "active" ? "Ativa" : "Inativa"}</Badge>
                </div>
                <p className="text-caption text-muted-foreground">{bag.seller}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-secondary/50 p-2 text-center">
                    <p className="text-title font-semibold tabular-nums">{bag.totalItems}</p>
                    <p className="text-caption text-muted-foreground">Na mala</p>
                  </div>
                  <div className="rounded-md bg-success/5 p-2 text-center">
                    <p className="text-title font-semibold tabular-nums text-success">{bag.soldItems}</p>
                    <p className="text-caption text-muted-foreground">Vendidas</p>
                  </div>
                  <div className="rounded-md bg-warning/5 p-2 text-center">
                    <p className="text-title font-semibold tabular-nums text-warning">{bag.withClient}</p>
                    <p className="text-caption text-muted-foreground">C/ cliente</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {bag.items.map(item => (
                    <div key={item.code} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-ui font-medium">{item.model}</p>
                        <p className="text-caption text-muted-foreground">{item.code}</p>
                      </div>
                      <div className="flex items-center gap-2 text-caption tabular-nums">
                        <span className="text-muted-foreground">{item.qty} un.</span>
                        <span className="text-success">{item.sold} vend.</span>
                        {item.withClient > 0 && <span className="text-warning">{item.withClient} c/cli</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Conferência</Button>
                  <Button variant="outline" size="sm" className="flex-1">Repor</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {bags.length === 0 && (
            <div className="text-center py-12 text-muted-foreground col-span-2">
              <p className="text-ui">Nenhuma mala encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
