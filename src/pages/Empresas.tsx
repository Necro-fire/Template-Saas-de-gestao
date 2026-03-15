import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockEmpresa } from "@/data/mockData";
import { toast } from "sonner";

export default function Empresas() {
  const [empresa] = useState(mockEmpresa);

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-title font-semibold tracking-tighter">Empresa Emissora</h1>
        <p className="text-ui text-muted-foreground">Dados fiscais da empresa para emissão de NF-e</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-ui">Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label className="text-caption">Razão Social</Label>
              <Input defaultValue={empresa.razaoSocial} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Nome Fantasia</Label>
              <Input defaultValue={empresa.nomeFantasia} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CNPJ</Label>
              <Input defaultValue={empresa.cnpj} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Inscrição Estadual</Label>
              <Input defaultValue={empresa.inscricaoEstadual} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Regime Tributário</Label>
              <Select defaultValue={empresa.regimeTributario}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CNAE</Label>
              <Input defaultValue={empresa.cnae} className="h-9" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label className="text-caption">Endereço</Label>
              <Input defaultValue={empresa.endereco} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Cidade</Label>
              <Input defaultValue={empresa.cidade} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Estado</Label>
              <Input defaultValue={empresa.estado} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CEP</Label>
              <Input defaultValue={empresa.cep} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Telefone</Label>
              <Input defaultValue={empresa.telefone} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Email</Label>
              <Input defaultValue={empresa.email} className="h-9" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-caption">Série da NF</Label>
              <Input defaultValue={empresa.serieNF} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Ambiente</Label>
              <Select defaultValue={empresa.ambiente}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Código Município</Label>
              <Input defaultValue={empresa.codigoMunicipio} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Código IBGE</Label>
              <Input defaultValue={empresa.codigoIBGE} className="h-9" />
            </div>
          </div>

          <Button className="w-full h-10" onClick={() => toast.success("Dados da empresa salvos")}>
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
