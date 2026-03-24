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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DbProduct } from "@/hooks/useSupabaseData";
import { generateProductCodes, findProductByHash, upsertEstoque } from "@/hooks/useSupabaseData";

import { generateProductHash } from "@/lib/productHash";
import {
  CLASSIFICACOES, CATEGORIAS_IDADE, GENEROS, ESTILOS, TODAS_CORES, CORES_SOLIDAS,
  MATERIAIS_ARO, MATERIAIS_HASTE, TIPOS_LENTE, CORES_LENTE_CLIPON,
  MEDIDAS_LENTE, MEDIDAS_ALTURA_LENTE, MEDIDAS_PONTE, MEDIDAS_HASTE as MEDIDAS_HASTE_RANGE,
  TIPOS_HASTE, PONTES_ARMACAO, CLASSIFICACOES_PRODUTO, type ClassificacaoProduto,
} from "@/data/productConstants";
import {
  ACESSORIOS_CATEGORIAS, getTiposByCategoria, getVariacoesByTipo,
  getCoresByVariacao, getMateriaisByCategoria, isEstojo,
} from "@/data/accessoryConstants";

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
  const [price, setPrice] = useState<number>(0);
  const [custo, setCusto] = useState<number>(0);
  const [detail, setDetail] = useState("");
  const [filial, setFilial] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  // Frame-specific fields
  const [categoriaIdade, setCategoriaIdade] = useState("");
  const [genero, setGenero] = useState("");
  const [estilo, setEstilo] = useState("");
  const [corArmacao, setCorArmacao] = useState("");
  const [corHaste, setCorHaste] = useState("");
  const [materialAro, setMaterialAro] = useState("");
  const [materialHaste, setMaterialHaste] = useState("");
  const [lensSize, setLensSize] = useState("");
  const [alturaLente, setAlturaLente] = useState("");
  const [bridgeSize, setBridgeSize] = useState("");
  const [templeSize, setTempleSize] = useState("");
  const [tipoLente, setTipoLente] = useState("");
  const [polarizado, setPolarizado] = useState("");
  const [tipoHaste, setTipoHaste] = useState("");
  const [ponteArmacao, setPonteArmacao] = useState("");
  const [ncm, setNcm] = useState("");
  const [classificacao, setClassificacao] = useState("");

  // Accessory fields (new hierarchical)
  const [subcategoriaAcessorio, setSubcategoriaAcessorio] = useState(""); // legacy compat
  const [categoriaAcessorio, setCategoriaAcessorio] = useState("");
  const [tipoAcessorio, setTipoAcessorio] = useState("");
  const [variacaoAcessorio, setVariacaoAcessorio] = useState("");
  const [corAcessorio, setCorAcessorio] = useState("");
  const [materialAcessorio, setMaterialAcessorio] = useState("");

  const isEditing = !!product;

  // Derived lists for cascading selects
  const tiposAcessorio = getTiposByCategoria(categoriaAcessorio);
  const variacoesAcessorio = getVariacoesByTipo(categoriaAcessorio, tipoAcessorio);
  const coresAcessorio = getCoresByVariacao(categoriaAcessorio, tipoAcessorio, variacaoAcessorio);
  const materiaisEstojo = getMateriaisByCategoria(categoriaAcessorio);
  const showMaterial = isEstojo(categoriaAcessorio);

  useEffect(() => {
    if (product) {
      setIsAcessorio(product.is_acessorio || false);
      setReferencia(product.referencia || "");
      setName(product.model);
      setPrice(Number(product.retail_price) || 0);
      setCusto(Number(product.custo) || 0);
      setDetail(product.description || "");
      setFilial(filialLocked ? selectedFilial : product.filial_id);
      setQuantidade(String(product.stock));
      setCategoriaIdade(product.categoria_idade || "");
      setGenero(product.genero || "");
      setEstilo(product.estilo || "");
      setCorArmacao(product.cor_armacao || "");
      setCorHaste((product as any).cor_haste || "");
      setMaterialAro(product.material_aro || "");
      setMaterialHaste(product.material_haste || "");
      setLensSize(product.lens_size ? String(product.lens_size) : "");
      setAlturaLente(product.altura_lente ? String(product.altura_lente) : "");
      setBridgeSize(product.bridge_size ? String(product.bridge_size) : "");
      setTempleSize(product.temple_size ? String(product.temple_size) : "");
      setTipoLente(product.tipo_lente || "");
      setPolarizado((product as any).polarizado || "");
      setTipoHaste((product as any).tipo_haste || "");
      setPonteArmacao((product as any).ponte_armacao || "");
      setSubcategoriaAcessorio((product as any).subcategoria_acessorio || "");
      setCategoriaAcessorio((product as any).categoria_acessorio || "");
      setTipoAcessorio((product as any).tipo_acessorio || "");
      setVariacaoAcessorio((product as any).variacao_acessorio || "");
      setCorAcessorio((product as any).cor_acessorio || "");
      setMaterialAcessorio((product as any).material_acessorio || "");
      
      setNcm((product as any).ncm || "");
      setClassificacao((product as any).classificacao || "");
      setImagePreview(product.image_url || null);
      setDuplicateInfo(null);
    } else {
      resetForm();
    }
  }, [product, open, selectedFilial, filialLocked]);

  const resetForm = () => {
    setIsAcessorio(false);
    setReferencia("");
    setName("");
    setPrice(0);
    setCusto(0);
    setDetail("");
    setFilial(filialLocked ? selectedFilial : "");
    setQuantidade("1");
    
    setImageFile(null);
    setImagePreview(null);
    setCategoriaIdade("");
    setGenero("");
    setEstilo("");
    setCorArmacao("");
    setCorHaste("");
    setMaterialAro("");
    setMaterialHaste("");
    setLensSize("");
    setAlturaLente("");
    setBridgeSize("");
    setTempleSize("");
    setTipoLente("");
    setPolarizado("");
    setTipoHaste("");
    setPonteArmacao("");
    setNcm("");
    setClassificacao("");
    setSubcategoriaAcessorio("");
    setCategoriaAcessorio("");
    setTipoAcessorio("");
    setVariacaoAcessorio("");
    setCorAcessorio("");
    setMaterialAcessorio("");
    setDuplicateInfo(null);
  };

  // Build a legacy-compat subcategoria string from hierarchical fields
  const buildSubcategoria = () => {
    if (!categoriaAcessorio) return "";
    const parts = [categoriaAcessorio, tipoAcessorio, variacaoAcessorio].filter(Boolean);
    return parts.join(" > ");
  };

  // Check for duplicates when key fields change (only for new products)
  useEffect(() => {
    if (isEditing || !referencia.trim() || !filial) {
      setDuplicateInfo(null);
      return;
    }

    const checkDuplicate = async () => {
      const filials = filial === "all" ? ["1", "2", "3"] : [filial];
      for (const fId of filials) {
        if (classificacao) {
          const { data: exactMatch } = await (supabase as any)
            .from("produtos")
            .select("id, referencia, classificacao")
            .eq("referencia", referencia.trim())
            .eq("classificacao", classificacao)
            .eq("filial_id", fId)
            .maybeSingle();
          if (exactMatch) {
            setDuplicateInfo(`Este produto já está cadastrado no sistema. (Código "${referencia.trim()}" com classificação ${classificacao} na filial ${fId})`);
            return;
          }
        }
      }
      setDuplicateInfo(null);
    };

    const timeout = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeout);
  }, [referencia, classificacao, filial, isEditing]);

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
    if (!referencia.trim()) { toast.error("Informe o código da peça"); return; }
    if (!classificacao) { toast.error("Selecione a classificação (C1-C10)"); return; }
    if (!price || price <= 0) { toast.error("Informe um preço válido"); return; }
    if (!filial) { toast.error("Selecione uma filial"); return; }
    if (!/^\d{8}$/.test(ncm)) { toast.error("Informe um NCM válido com 8 dígitos numéricos"); return; }

    if (duplicateInfo && !isEditing) {
      toast.error("Este produto já está cadastrado no sistema.");
      return;
    }

    const filials = isEditing ? [filial] : (filial === "all" ? ["1", "2", "3"] : [filial]);
    for (const fId of filials) {
      const { data: existing } = await (supabase as any)
        .from("produtos")
        .select("id")
        .eq("referencia", referencia.trim())
        .eq("classificacao", classificacao)
        .eq("filial_id", fId)
        .maybeSingle();
      if (existing && (!isEditing || existing.id !== product?.id)) {
        toast.error("Este produto já está cadastrado no sistema.");
        return;
      }
    }

    setSaving(true);
    try {
      let imageUrl = isEditing ? (product?.image_url || "") : "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const subcatComputed = buildSubcategoria();

      const hash = generateProductHash({
        referencia: referencia.trim(),
        classificacao,
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
        subcategoriaAcessorio: subcatComputed,
      });

      const qty = Number(quantidade) || 1;

      const accessoryFields = {
        categoria_acessorio: isAcessorio ? categoriaAcessorio : "",
        tipo_acessorio: isAcessorio ? tipoAcessorio : "",
        variacao_acessorio: isAcessorio ? variacaoAcessorio : "",
        cor_acessorio: isAcessorio ? corAcessorio : "",
        material_acessorio: isAcessorio ? materialAcessorio : "",
      };

      // Tipo de haste: se nenhuma opção marcada, é "Comum"
      const tipoHasteValue = isAcessorio ? "" : (tipoHaste || "Comum");
      const polarizadoValue = isAcessorio ? "" : polarizado;

      const buildBaseData = (codes?: { code: string; barcode: string }, fId?: string) => ({
        ...(codes ? { code: codes.code, barcode: codes.barcode } : {}),
        referencia: referencia.trim(),
        model: referencia.trim(),
        classificacao,
        retail_price: price,
        custo: custo || 0,
        description: detail.trim(),
        image_url: imageUrl,
        filial_id: fId || filial,
        is_acessorio: isAcessorio,
        categoria_idade: isAcessorio ? "" : categoriaIdade,
        genero: isAcessorio ? "" : genero,
        estilo: isAcessorio ? "" : estilo,
        cor_armacao: isAcessorio ? "" : corArmacao,
        cor_haste: isAcessorio ? "" : corHaste,
        color: isAcessorio ? corAcessorio : corArmacao,
        material_aro: isAcessorio ? "" : materialAro,
        material_haste: isAcessorio ? "" : materialHaste,
        lens_size: isAcessorio ? 0 : (Number(lensSize) || 0),
        altura_lente: isAcessorio ? 0 : (Number(alturaLente) || 0),
        bridge_size: isAcessorio ? 0 : (Number(bridgeSize) || 0),
        temple_size: isAcessorio ? 0 : (Number(templeSize) || 0),
        tipo_lente: isAcessorio ? "" : tipoLente,
        polarizado: polarizadoValue,
        tipo_haste: tipoHasteValue,
        ponte_armacao: isAcessorio ? "" : ponteArmacao,
        subcategoria_acessorio: isAcessorio ? subcatComputed : "",
        hash_produto: hash,
        ncm,
        stock: qty,
        ...accessoryFields,
      });

      if (isEditing) {
        const baseData = buildBaseData();

        const { error } = await (supabase as any).from("produtos").update(baseData).eq("id", product!.id);
        if (error) throw error;

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
        const targetFilials = filial === "all" ? ["1", "2", "3"] : [filial];

        for (const fId of targetFilials) {
          const codes = await generateProductCodes();
          const baseData = buildBaseData(codes, fId);

          const { data: newProduct, error } = await (supabase as any).from("produtos").insert(baseData).select().single();
          if (error) throw error;

          await (supabase as any).from("estoque").insert({
            produto_id: newProduct.id,
            filial_id: fId,
            quantidade: qty,
          });

          toast.success(
            targetFilials.length > 1
              ? `Produto cadastrado na filial ${fId}!`
              : `Produto cadastrado! Código de barras: ${codes.barcode}`
          );
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

  const sortedCoresSolidas = [...CORES_SOLIDAS].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Duplicate Detection Banner */}
          {duplicateInfo && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-caption text-destructive">{duplicateInfo}</p>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="referencia">Código da peça *</Label>
                <Input id="referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: ISA2387" className="mt-1.5" />
              </div>
              <div>
                <Label>Classificação *</Label>
                <Select value={classificacao} onValueChange={setClassificacao}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {CLASSIFICACOES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="ncm">Código NCM *</Label>
              <Input
                id="ncm"
                value={ncm}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setNcm(v);
                }}
                placeholder="Ex: 90049090"
                maxLength={8}
                className="mt-1.5"
              />
              {ncm.length > 0 && ncm.length < 8 && (
                <p className="text-xs text-destructive mt-1">{8 - ncm.length} dígitos restantes</p>
              )}
            </div>
            {isEditing && product && (
              <div>
                <Label className="text-muted-foreground">Código de barras</Label>
                <Input value={product.barcode} disabled className="mt-1.5 bg-muted" />
              </div>
            )}
            {!isEditing && (
              <div className="flex items-center gap-2 text-caption text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Código de barras será gerado automaticamente</span>
              </div>
            )}
          </fieldset>


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
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Adulto e Infantil" /></SelectTrigger>
                      <SelectContent>
                        {[...CATEGORIAS_IDADE].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gênero</Label>
                    <Select value={genero} onValueChange={setGenero}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Masculino, Feminino e Unissex" /></SelectTrigger>
                      <SelectContent>
                        {[...GENEROS].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
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
                    {[...ESTILOS].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Cor da Armação + Cor da Haste */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Cores</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cor da Armação</Label>
                    <Select value={corArmacao} onValueChange={setCorArmacao}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a cor" /></SelectTrigger>
                      <SelectContent>
                        {[...TODAS_CORES].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cor da Haste</Label>
                    <Select value={corHaste} onValueChange={setCorHaste}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a cor" /></SelectTrigger>
                      <SelectContent>
                        {sortedCoresSolidas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </fieldset>

              {/* 5. Material */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Material</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Material do Aro</Label>
                    <Select value={materialAro} onValueChange={setMaterialAro}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {[...MATERIAIS_ARO].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Material da Haste</Label>
                    <Select value={materialHaste} onValueChange={setMaterialHaste}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {[...MATERIAIS_HASTE].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </fieldset>

              {/* Tipo de Haste */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Haste</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo de Haste</Label>
                    <Select value={tipoHaste} onValueChange={setTipoHaste}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Comum" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Comum">Comum</SelectItem>
                        {TIPOS_HASTE.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">Se não selecionado, será considerado Comum</p>
                  </div>
                  <div>
                    <Label>Ponte da Armação</Label>
                    <Select value={ponteArmacao} onValueChange={setPonteArmacao}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {PONTES_ARMACAO.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                    <Label>Comprimento da Haste ({MEDIDAS_HASTE_RANGE.min}-{MEDIDAS_HASTE_RANGE.max})</Label>
                    <Input type="number" min={MEDIDAS_HASTE_RANGE.min} max={MEDIDAS_HASTE_RANGE.max} value={templeSize} onChange={(e) => setTempleSize(e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </fieldset>

              {/* 7. Tipo de Lente + Polarizado */}
              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="text-sm font-semibold px-1">Lente</legend>
                <div>
                  <Label>Tipo de Lente</Label>
                  <Select value={tipoLente} onValueChange={(v) => {
                    setTipoLente(v);
                    if (v === "Receituário") setPolarizado("");
                  }}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o tipo de lente" /></SelectTrigger>
                    <SelectContent>
                      {[...TIPOS_LENTE].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {tipoLente && tipoLente !== "Receituário" && (
                  <div>
                    <Label>Polarizado</Label>
                    <Select value={polarizado} onValueChange={setPolarizado}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </fieldset>
            </>
          )}

          {/* ACCESSORY-SPECIFIC FIELDS — Cascading selects */}
          {isAcessorio && (
            <fieldset className="space-y-3 rounded-lg border p-3">
              <legend className="text-sm font-semibold px-1">Classificação do Acessório</legend>

              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
                <Select
                  value={categoriaAcessorio}
                  onValueChange={(v) => {
                    setCategoriaAcessorio(v);
                    setTipoAcessorio("");
                    setVariacaoAcessorio("");
                    setCorAcessorio("");
                    setMaterialAcessorio("");
                  }}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {[...ACESSORIOS_CATEGORIAS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(c => (
                      <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo */}
              {categoriaAcessorio && tiposAcessorio.length > 0 && (
                <div>
                  <Label>Tipo *</Label>
                  <Select
                    value={tipoAcessorio}
                    onValueChange={(v) => {
                      setTipoAcessorio(v);
                      setVariacaoAcessorio("");
                      setCorAcessorio("");
                    }}
                  >
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {tiposAcessorio.map(t => (
                        <SelectItem key={t.nome} value={t.nome}>{t.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Variação */}
              {tipoAcessorio && variacoesAcessorio.length > 0 && (
                <div>
                  <Label>Variação *</Label>
                  <Select
                    value={variacaoAcessorio}
                    onValueChange={(v) => {
                      setVariacaoAcessorio(v);
                      setCorAcessorio("");
                    }}
                  >
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a variação" /></SelectTrigger>
                    <SelectContent>
                      {variacoesAcessorio.map(v => (
                        <SelectItem key={v.nome} value={v.nome}>{v.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Material (Estojos only) */}
              {showMaterial && materiaisEstojo.length > 0 && (
                <div>
                  <Label>Material</Label>
                  <Select value={materialAcessorio} onValueChange={setMaterialAcessorio}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                    <SelectContent>
                      {materiaisEstojo.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Cor */}
              {variacaoAcessorio && coresAcessorio.length > 0 && (
                <div>
                  <Label>Cor</Label>
                  <Select value={corAcessorio} onValueChange={setCorAcessorio}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a cor" /></SelectTrigger>
                    <SelectContent>
                      {coresAcessorio.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </fieldset>
          )}

          {/* Preço, Custo e Quantidade */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="product-price">Preço (R$) *</Label>
              <CurrencyInput id="product-price" value={price} onValueChange={setPrice} placeholder="0,00" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="product-custo">Custo (R$)</Label>
              <CurrencyInput id="product-custo" value={custo} onValueChange={setCusto} placeholder="0,00" className="mt-1.5" />
            </div>
            <div>
              <Label>{isEditing ? "Quantidade em estoque" : "Quantidade a adicionar"}</Label>
              <div className="mt-1.5">
                <Input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-20 text-center font-semibold tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Detalhe */}
          <div>
            <Label htmlFor="product-detail">Detalhe (opcional)</Label>
            <Textarea id="product-detail" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Descrição ou observações" className="mt-1.5 min-h-[60px]" />
          </div>

          {/* Filial */}
          <div>
            <Label>Filial *</Label>
            {filialLocked ? (
              <div className="mt-1.5">
                <Input value={`Filial ${selectedFilial}`} disabled className="bg-muted" />
                <p className="text-[11px] text-muted-foreground mt-1">Filial definida pelo contexto atual. Selecione "Todas" para escolher outra.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || (!!duplicateInfo && !isEditing)}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
