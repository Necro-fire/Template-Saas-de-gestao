import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ open, onOpenChange }: ProductFormDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [detail, setDetail] = useState("");
  const [filial, setFilial] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDetail("");
    setFilial("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateCode = () => {
    const prefix = "PROD";
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${rand}`;
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
    if (!name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Informe um preço válido");
      return;
    }
    if (!filial) {
      toast.error("Selecione uma filial");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const filials = filial === "all" ? ["1", "2", "3"] : [filial];
      const code = generateCode();

      const products = filials.map((fId) => ({
        code,
        model: name.trim(),
        retail_price: Number(price),
        description: detail.trim(),
        image_url: imageUrl,
        filial_id: fId,
        stock: 0,
      }));

      const { error } = await (supabase as any).from("produtos").insert(products);
      if (error) throw error;

      toast.success(
        filials.length > 1
          ? "Produto cadastrado em todas as filiais!"
          : "Produto cadastrado com sucesso!"
      );
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar produto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <Label>Imagem do produto</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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

          {/* Name */}
          <div>
            <Label htmlFor="product-name">Nome do produto *</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Armação Ray-Ban RB5154"
              className="mt-1.5"
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="product-price">Preço (R$) *</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              className="mt-1.5"
            />
          </div>

          {/* Detail */}
          <div>
            <Label htmlFor="product-detail">Detalhe (opcional)</Label>
            <Textarea
              id="product-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Descrição ou observações sobre o produto"
              className="mt-1.5 min-h-[60px]"
            />
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
                <SelectItem value="all">Todas as Filiais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
