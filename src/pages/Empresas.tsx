import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Empresas() {
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
              <Input placeholder="Razão social da empresa" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Nome Fantasia</Label>
              <Input placeholder="Nome fantasia" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Inscrição Estadual</Label>
              <Input placeholder="Inscrição estadual" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Regime Tributário</Label>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CNAE</Label>
              <Input placeholder="CNAE" className="h-9" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label className="text-caption">Endereço</Label>
              <Input placeholder="Endereço completo" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Cidade</Label>
              <Input placeholder="Cidade" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Estado</Label>
              <Input placeholder="UF" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">CEP</Label>
              <Input placeholder="00000-000" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Telefone</Label>
              <Input placeholder="(00) 0000-0000" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Email</Label>
              <Input placeholder="email@empresa.com" className="h-9" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-caption">Série da NF</Label>
              <Input placeholder="1" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Ambiente</Label>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Código Município</Label>
              <Input placeholder="Código do município" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-caption">Código IBGE</Label>
              <Input placeholder="Código IBGE" className="h-9" />
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
