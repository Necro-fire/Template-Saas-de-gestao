import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useStockAlerts, type AlertaEstoque } from "@/hooks/useStockAlerts";
import { ESTILOS, TODAS_CORES, SUBCATEGORIAS_ACESSORIOS } from "@/data/productConstants";
import { toast } from "sonner";

const ACCESSORY_CATEGORIES = Object.keys(SUBCATEGORIAS_ACESSORIOS);

export function StockAlertConfigDialog() {
  const { data: alerts, upsert, remove } = useStockAlerts();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"list" | "tipo" | "form">("list");
  const [formTipo, setFormTipo] = useState<"produto" | "acessorio">("produto");
  const [formCategoria, setFormCategoria] = useState("");
  const [formCor, setFormCor] = useState<string>("nenhuma");
  const [formMin, setFormMin] = useState("");

  const resetForm = () => {
    setStep("list");
    setFormCategoria("");
    setFormCor("nenhuma");
    setFormMin("");
  };

  const handleSave = async () => {
    const min = parseInt(formMin, 10);
    if (!formCategoria || isNaN(min) || min < 1) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    try {
      await upsert({
        tipo: formTipo,
        categoria: formCategoria,
        cor: formTipo === "acessorio" && formCor !== "nenhuma" ? formCor : null,
        quantidade_minima: min,
      });
      toast.success("Alerta configurado com sucesso");
      resetForm();
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success("Alerta removido");
    } catch (e: any) {
      toast.error("Erro ao remover: " + e.message);
    }
  };

  const productAlerts = alerts.filter(a => a.tipo === "produto");
  const accessoryAlerts = alerts.filter(a => a.tipo === "acessorio");

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Configurações de Alerta
          {alerts.length > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
              {alerts.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[480px] max-w-[95vw] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-sm font-semibold">Configurações de Alerta de Estoque</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="p-4 pt-2 space-y-4">
            {step === "list" && (
              <>
                {/* Existing alerts */}
                {alerts.length > 0 ? (
                  <>
                    {productAlerts.length > 0 && (
                      <>
                        <p className="text-caption text-muted-foreground font-medium">Produtos (Armação)</p>
                        <div className="space-y-1">
                          {productAlerts.map(a => (
                            <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30">
                              <div>
                                <p className="text-ui font-medium">{a.categoria}</p>
                                <p className="text-caption text-muted-foreground">mín: {a.quantidade_minima} un.</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {accessoryAlerts.length > 0 && (
                      <>
                        <p className="text-caption text-muted-foreground font-medium">Acessórios</p>
                        <div className="space-y-1">
                          {accessoryAlerts.map(a => (
                            <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30">
                              <div>
                                <p className="text-ui font-medium">
                                  {a.categoria}{a.cor ? ` - ${a.cor}` : ""}
                                </p>
                                <p className="text-caption text-muted-foreground">mín: {a.quantidade_minima} un.</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <Separator />
                  </>
                ) : (
                  <p className="text-ui text-muted-foreground text-center py-4">Nenhum alerta configurado</p>
                )}

                <Button variant="outline" className="w-full gap-2" onClick={() => setStep("tipo")}>
                  <Plus className="h-4 w-4" />
                  Novo Alerta
                </Button>
              </>
            )}

            {step === "tipo" && (
              <div className="space-y-3">
                <p className="text-ui font-medium">Tipo de alerta:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-1"
                    onClick={() => { setFormTipo("produto"); setStep("form"); }}
                  >
                    <span className="text-ui font-semibold">Produto</span>
                    <span className="text-caption text-muted-foreground">Óculos / Armação</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-1"
                    onClick={() => { setFormTipo("acessorio"); setStep("form"); }}
                  >
                    <span className="text-ui font-semibold">Acessório</span>
                    <span className="text-caption text-muted-foreground">Estojos, Cordões, etc.</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={resetForm}>← Voltar</Button>
              </div>
            )}

            {step === "form" && (
              <div className="space-y-3">
                <p className="text-ui font-medium">
                  {formTipo === "produto" ? "Alerta de Produto (Armação)" : "Alerta de Acessório"}
                </p>

                <div className="space-y-1">
                  <Label className="text-caption">Categoria</Label>
                  <Select value={formCategoria} onValueChange={setFormCategoria}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {formTipo === "produto"
                        ? ESTILOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)
                        : ACCESSORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>

                {formTipo === "acessorio" && (
                  <div className="space-y-1">
                    <Label className="text-caption">Cor (opcional)</Label>
                    <Select value={formCor} onValueChange={setFormCor}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        {TODAS_CORES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-caption">Quantidade mínima para alerta</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 40"
                    value={formMin}
                    onChange={(e) => setFormMin(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep("tipo")}>← Voltar</Button>
                  <Button size="sm" className="flex-1" onClick={handleSave}>Salvar Alerta</Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
