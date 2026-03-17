import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFilial } from "@/contexts/FilialContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DbProduct } from "@/hooks/useSupabaseData";
import { generateProductCodes, findProductByHash, upsertEstoque } from "@/hooks/useSupabaseData";
import { useProductTypes } from "@/hooks/useProductTypes";
import { generateProductHash } from "@/lib/productHash";
import {
  CATEGORIAS_IDADE, GENEROS, ESTILOS, TODAS_CORES,
  MATERIAIS, TIPOS_LENTE, SUBCATEGORIAS_ACESSORIOS,
  MEDIDAS_LENTE, MEDIDAS_ALTURA_LENTE, MEDIDAS_PONTE, MEDIDAS_HASTE,
} from "@/data/productConstants";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: DbProduct | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { selectedFilial } = useFilial();
  const filialLocked = selectedFilial !== "all";
  const [isAcessorio, setIsAcessorio] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [detail, setDetail] = useState("");
  const [filial, setFilial] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [tipoProdutoId, setTipoProdutoId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [wholesaleEnabled, setWholesaleEnabled] = useState(false);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQty, setWholesaleMinQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: tipos } = useProductTypes();

  // Frame-specific fields
  const [categoriaIdade, setCategoriaIdade] = useState("");
  const [genero, setGenero] = useState("");
  const [estilo, setEstilo] = useState("");
  const [corArmacao, setCorArmacao] = useState("");
  const [materialAro, setMaterialAro] = useState("");
  const [materialHaste, setMaterialHaste] = useState("");
  const [lensSize, setLensSize] = useState("");
  const [alturaLente, setAlturaLente] = useState("");
  const [bridgeSize, setBridgeSize] = useState("");
  const [templeSize, setTempleSize] = useState("");
  const [tipoLente, setTipoLente] = useState("");

  // Accessory field
  const [subcategoriaAcessorio, setSubcategoriaAcessorio] = useState("");

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setIsAcessorio(product.is_acessorio || false);
      setReferencia(product.referencia || product.code || "");
      setName(product.model);
      setPrice(String(product.retail_price));
      setDetail(product.description || "");
      setFilial(filialLocked ? selectedFilial : product.filial_id);
      setQuantidade(String(product.stock));
      // ... keep existing code
      setDuplicateInfo(null);
    } else {
      resetForm();
    }
  }, [product, open, selectedFilial, filialLocked]);

  const resetForm = () => {
    setIsAcessorio(false);
    setReferencia("");
    setName("");
    setPrice("");
    setDetail("");
    setFilial("");
    setQuantidade("1");
    setTipoProdutoId("");
    setWholesaleEnabled(false);
    setWholesalePrice("");
    setWholesaleMinQty("");
    setImageFile(null);
    setImagePreview(null);
    setCategoriaIdade("");
    setGenero("");
    setEstilo("");
    setCorArmacao("");
    setMaterialAro("");
    setMaterialHaste("");
    setLensSize("");
    setAlturaLente("");
    setBridgeSize("");
    setTempleSize("");
    setTipoLente("");
    setSubcategoriaAcessorio("");
    setDuplicateInfo(null);
  };

  // Check for duplicates when key fields change (only for new products)
  useEffect(() => {
    if (isEditing || !referencia.trim() || !filial) {
      setDuplicateInfo(null);
      return;
    }
    const hash = generateProductHash({
      referencia: referencia.trim(),
      categoriaIdade,
      genero,
      estilo,
      corArmacao,
      materialAro,
      materialHaste,
      lensSize: Number(lensSize) || 0,
      alturaLente: Number(alturaLente) || 0,
      bridgeSize: Number(bridgeSize) || 0,
      templeSize: Number(templeSize) || 0,
      tipoLente,
      isAcessorio,
      subcategoriaAcessorio,
    });

    const checkDuplicate = async () => {
      const filials = filial === "all" ? ["1", "2", "3"] : [filial];
      for (const fId of filials) {
        const existing = await findProductByHash(hash, fId);
        if (existing) {
          setDuplicateInfo(`Produto "${existing.model}" já existe na filial ${fId}. A quantidade será adicionada ao estoque existente.`);
          return;
        }
      }
      setDuplicateInfo(null);
    };

    const timeout = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeout);
  }, [referencia, categoriaIdade, genero, estilo, corArmacao, materialAro, materialHaste, lensSize, alturaLente, bridgeSize, templeSize, tipoLente, isAcessorio, subcategoriaAcessorio, filial, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!referencia.trim()) { toast.error("Informe a referência do produto"); return; }
    if (!name.trim()) { toast.error("Informe o nome do produto"); return; }
    if (!price || Number(price) <= 0) { toast.error("Informe um preço válido"); return; }
    if (!filial) { toast.error("Selecione uma filial"); return; }

    setSaving(true);
    try {
      let imageUrl = isEditing ? (product?.image_url || "") : "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const wholesaleData = wholesaleEnabled
        ? { wholesale_price: Number(wholesalePrice) || 0, wholesale_min_qty: Number(wholesaleMinQty) || 0 }
        : { wholesale_price: 0, wholesale_min_qty: 0 };

      const hash = generateProductHash({
        referencia: referencia.trim(),
        categoriaIdade,
        genero,
        estilo,
        corArmacao,
        materialAro,
        materialHaste,
        lensSize: Number(lensSize) || 0,
        alturaLente: Number(alturaLente) || 0,
        bridgeSize: Number(bridgeSize) || 0,
        templeSize: Number(templeSize) || 0,
        tipoLente,
        isAcessorio,
        subcategoriaAcessorio,
      });

      const qty = Number(quantidade) || 1;

      if (isEditing) {
        // Update existing product
        const baseData = {
          referencia: referencia.trim(),
          model: name.trim(),
          retail_price: Number(price),
          description: detail.trim(),
          image_url: imageUrl,
          filial_id: filial,
          tipo_produto_id: tipoProdutoId && tipoProdutoId !== "none" ? tipoProdutoId : null,
          is_acessorio: isAcessorio,
          categoria_idade: isAcessorio ? "" : categoriaIdade,
          genero: isAcessorio ? "" : genero,
          estilo: isAcessorio ? "" : estilo,
          cor_armacao: isAcessorio ? "" : corArmacao,
          color: isAcessorio ? "" : corArmacao,
          material_aro: isAcessorio ? "" : materialAro,
          material_haste: isAcessorio ? "" : materialHaste,
          material: isAcessorio ? "" : materialAro,
          lens_size: isAcessorio ? 0 : (Number(lensSize) || 0),
          altura_lente: isAcessorio ? 0 : (Number(alturaLente) || 0),
          bridge_size: isAcessorio ? 0 : (Number(bridgeSize) || 0),
          temple_size: isAcessorio ? 0 : (Number(templeSize) || 0),
          tipo_lente: isAcessorio ? "" : tipoLente,
          subcategoria_acessorio: isAcessorio ? subcategoriaAcessorio : "",
          hash_produto: hash,
          stock: qty,
          ...wholesaleData,
        };

        const { error } = await (supabase as any).from("produtos").update(baseData).eq("id", product!.id);
        if (error) throw error;

        // Sync estoque (set absolute value)
        const { data: existingEstoque } = await (supabase as any)
          .from("estoque")
          .select("id")
          .eq("produto_id", product!.id)
          .eq("filial_id", filial)
          .maybeSingle();

        if (existingEstoque) {
          await (supabase as any).from("estoque").update({ quantidade: qty }).eq("id", existingEstoque.id);
        } else {
          await (supabase as any).from("estoque").insert({ produto_id: product!.id, filial_id: filial, quantidade: qty });
        }

        toast.success("Produto atualizado com sucesso!");
      } else {
        // New product - check for duplicates
        const filials = filial === "all" ? ["1", "2", "3"] : [filial];

        for (const fId of filials) {
          const existing = await findProductByHash(hash, fId);

          if (existing) {
            // Product exists - just add stock
            await upsertEstoque(existing.id, fId, qty);
            toast.success(`Produto "${existing.model}" já existe na filial ${fId}. +${qty} unidades adicionadas ao estoque!`);
          } else {
            // Generate auto code and barcode
            const codes = await generateProductCodes();

            const baseData = {
              code: codes.code,
              barcode: codes.barcode,
              referencia: referencia.trim(),
              model: name.trim(),
              retail_price: Number(price),
              description: detail.trim(),
              image_url: imageUrl,
              filial_id: fId,
              stock: qty,
              tipo_produto_id: tipoProdutoId && tipoProdutoId !== "none" ? tipoProdutoId : null,
              is_acessorio: isAcessorio,
              categoria_idade: isAcessorio ? "" : categoriaIdade,
              genero: isAcessorio ? "" : genero,
              estilo: isAcessorio ? "" : estilo,
              cor_armacao: isAcessorio ? "" : corArmacao,
              color: isAcessorio ? "" : corArmacao,
              material_aro: isAcessorio ? "" : materialAro,
              material_haste: isAcessorio ? "" : materialHaste,
              material: isAcessorio ? "" : materialAro,
              lens_size: isAcessorio ? 0 : (Number(lensSize) || 0),
              altura_lente: isAcessorio ? 0 : (Number(alturaLente) || 0),
              bridge_size: isAcessorio ? 0 : (Number(bridgeSize) || 0),
              temple_size: isAcessorio ? 0 : (Number(templeSize) || 0),
              tipo_lente: isAcessorio ? "" : tipoLente,
              subcategoria_acessorio: isAcessorio ? subcategoriaAcessorio : "",
              hash_produto: hash,
              ...wholesaleData,
            };

            const { data: newProduct, error } = await (supabase as any).from("produtos").insert(baseData).select().single();
            if (error) throw error;

            // Create estoque entry
            await (supabase as any).from("estoque").insert({
              produto_id: newProduct.id,
              filial_id: fId,
              quantidade: qty,
            });

            toast.success(
              filials.length > 1
                ? `Produto cadastrado na filial ${fId}! Código: ${codes.code}`
                : `Produto cadastrado! Código: ${codes.code} | Código de barras: ${codes.barcode}`
            );
          }
        }
      }

      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Duplicate Detection Banner */}
          {duplicateInfo && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-caption text-warning">{duplicateInfo}</p>
            </div>
          )}

          {/* Product Type Toggle */}
          <div className="rounded-lg border p-3 flex items-center justify-between">
            <Label htmlFor="acessorio-toggle" className="font-medium">É um Acessório?</Label>
            <Switch id="acessorio-toggle" checked={isAcessorio} onCheckedChange={setIsAcessorio} />
          </div>

          {/* Image */}
          <div>
            <Label>Imagem do produto</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 w-full aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors overflow-hidden bg-secondary/30"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-caption text-muted-foreground">Clique para adicionar imagem</span>
                </>
              )}
            </button>
          </div>

          {/* 1. Identificação */}
          <fieldset className="space-y-3 rounded-lg border p-3">
            <legend className="text-sm font-semibold px-1">Identificação</legend>
            <div>
              <Label htmlFor="referencia">Referência (código da peça) *</Label>
              <Input id="referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: ISA2387" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="product-name">Nome do produto *</Label>
              <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Armação Ray-Ban RB5154" className="mt-1.5" />
            </div>
            {isEditing && product && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Código interno</Label>
                  <Input value={product.code} disabled className="mt-1.5 bg-muted" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Código de barras</Label>
                  <Input value={product.barcode} disabled className="mt-1.5 bg-muted" />
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="flex items-center gap-2 text-caption text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Código interno e código de barras serão gerados automaticamente</span>
              </div>
            )}
          </fieldset>

          {/* Tipo de Produto */}
          {tipos.length > 0 && (
            <div>
              <Label>Tipo de Produto</Label>
              <Select value={tipoProdutoId} onValueChange={setTipoProdutoId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tipo</SelectItem>
                  {tipos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome_tipo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* FRAME-SPECIFIC FIELDS */}
          {!isAcessorio && (
            <>
              {/* 2. Classificação */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Classificação</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={categoriaIdade} onValueChange={setCategoriaIdade}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS_IDADE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gênero</Label>
                    <Select value={genero} onValueChange={setGenero}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {GENEROS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </fieldset>

              {/* 3. Estilo */}
              <div>
                <Label>Estilo da Armação</Label>
                <Select value={estilo} onValueChange={setEstilo}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o estilo" /></SelectTrigger>
                  <SelectContent>
                    {ESTILOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Cor */}
              <div>
                <Label>Cor da Armação</Label>
                <Select value={corArmacao} onValueChange={setCorArmacao}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a cor" /></SelectTrigger>
                  <SelectContent>
                    {TODAS_CORES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Material */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Material</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Material do Aro</Label>
                    <Select value={materialAro} onValueChange={setMaterialAro}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {MATERIAIS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Material da Haste</Label>
                    <Select value={materialHaste} onValueChange={setMaterialHaste}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {MATERIAIS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </fieldset>

              {/* 6. Medidas */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Medidas (mm)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Largura da Lente ({MEDIDAS_LENTE.min}-{MEDIDAS_LENTE.max})</Label>
                    <Input type="number" min={MEDIDAS_LENTE.min} max={MEDIDAS_LENTE.max} value={lensSize} onChange={(e) => setLensSize(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Altura da Lente ({MEDIDAS_ALTURA_LENTE.min}-{MEDIDAS_ALTURA_LENTE.max})</Label>
                    <Input type="number" min={MEDIDAS_ALTURA_LENTE.min} max={MEDIDAS_ALTURA_LENTE.max} value={alturaLente} onChange={(e) => setAlturaLente(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Largura da Ponte ({MEDIDAS_PONTE.min}-{MEDIDAS_PONTE.max})</Label>
                    <Input type="number" min={MEDIDAS_PONTE.min} max={MEDIDAS_PONTE.max} value={bridgeSize} onChange={(e) => setBridgeSize(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Comprimento da Haste ({MEDIDAS_HASTE.min}-{MEDIDAS_HASTE.max})</Label>
                    <Input type="number" min={MEDIDAS_HASTE.min} max={MEDIDAS_HASTE.max} value={templeSize} onChange={(e) => setTempleSize(e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </fieldset>

              {/* 7. Tipo de Lente */}
              <div>
                <Label>Tipo de Lente</Label>
                <Select value={tipoLente} onValueChange={setTipoLente}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o tipo de lente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {TIPOS_LENTE.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* ACCESSORY-SPECIFIC FIELDS */}
          {isAcessorio && (
            <fieldset className="space-y-3 rounded-lg border p-3">
              <legend className="text-sm font-semibold px-1">Categoria do Acessório</legend>
              <Select value={subcategoriaAcessorio} onValueChange={setSubcategoriaAcessorio}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o acessório" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBCATEGORIAS_ACESSORIOS).map(([grupo, items]) => (
                    <div key={grupo}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{grupo}</div>
                      {items.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          )}

          {/* Preço e Quantidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="product-price">Preço (R$) *</Label>
              <Input id="product-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className="mt-1.5" />
            </div>
            <div>
              <Label>{isEditing ? "Quantidade em estoque" : "Quantidade a adicionar"}</Label>
              <div className="mt-1.5">
                <NumericStepper value={quantidade ? Number(quantidade) : 1} onChange={(v) => setQuantidade(String(v))} min={isEditing ? 0 : 1} />
              </div>
            </div>
          </div>

          {/* Detalhe */}
          <div>
            <Label htmlFor="product-detail">Detalhe (opcional)</Label>
            <Textarea id="product-detail" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Descrição ou observações" className="mt-1.5 min-h-[60px]" />
          </div>

          {/* Wholesale Section */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="wholesale-toggle" className="font-medium">Configuração de Atacado</Label>
              <Switch id="wholesale-toggle" checked={wholesaleEnabled} onCheckedChange={setWholesaleEnabled} />
            </div>
            {wholesaleEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wholesale-min">Qtd mínima *</Label>
                  <Input id="wholesale-min" type="number" min="2" value={wholesaleMinQty} onChange={(e) => setWholesaleMinQty(e.target.value)} placeholder="Ex: 10" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="wholesale-price">Preço atacado (R$) *</Label>
                  <Input id="wholesale-price" type="number" min="0" step="0.01" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} placeholder="0,00" className="mt-1.5" />
                </div>
              </div>
            )}
          </div>

          {/* Filial */}
          <div>
            <Label>Filial *</Label>
            <Select value={filial} onValueChange={setFilial}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione a filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Filial 1</SelectItem>
                <SelectItem value="2">Filial 2</SelectItem>
                <SelectItem value="3">Filial 3</SelectItem>
                {!isEditing && <SelectItem value="all">Todas as Filiais</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {isEditing ? "Salvar" : duplicateInfo ? "Adicionar ao Estoque" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
