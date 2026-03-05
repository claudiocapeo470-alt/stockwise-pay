import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { EmojiPicker, IconColorPicker, getIconBgStyle } from "./EmojiPicker";
import { ImageCropUpload } from "./ImageCropUpload";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  min_quantity: number;
  category?: string;
  sku?: string;
  icon_emoji?: string;
  icon_bg_color?: string;
}

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const { updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    min_quantity: product?.min_quantity || 10,
    category: product?.category || "",
    sku: product?.sku || "",
    icon_emoji: product?.icon_emoji || "📦",
    icon_bg_color: product?.icon_bg_color || "bg-blue",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsSubmitting(true);
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        min_quantity: Number(formData.min_quantity),
        category: formData.category,
        sku: formData.sku,
        icon_emoji: formData.icon_emoji,
        icon_bg_color: formData.icon_bg_color,
      });
      onOpenChange(false);
      toast.success("Produit modifié avec succès");
    } catch (error) {
      toast.error("Erreur lors de la modification du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        quantity: product.quantity || 0,
        min_quantity: product.min_quantity || 10,
        category: product.category || "",
        sku: product.sku || "",
        icon_emoji: product.icon_emoji || "📦",
        icon_bg_color: product.icon_bg_color || "bg-blue",
      });
      setShowPicker(false);
    }
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={getIconBgStyle(formData.icon_bg_color)}>
              <span className="text-2xl">{formData.icon_emoji}</span>
            </div>
            Modifier le produit
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Icon selector */}
          <div className="space-y-2">
            <Label>Icône du produit</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="h-14 w-14 rounded-xl flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors"
                style={getIconBgStyle(formData.icon_bg_color)}
              >
                <span className="text-3xl">{formData.icon_emoji}</span>
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium">Changer l'icône</p>
                <p className="text-xs text-muted-foreground">Cliquez pour modifier</p>
              </div>
            </div>
            {showPicker && (
              <div className="space-y-3 p-3 border border-border rounded-xl bg-card">
                <EmojiPicker value={formData.icon_emoji} onChange={v => setFormData(p => ({ ...p, icon_emoji: v }))} />
                <div className="space-y-2">
                  <Label className="text-xs">Couleur de fond</Label>
                  <IconColorPicker value={formData.icon_bg_color} onChange={v => setFormData(p => ({ ...p, icon_bg_color: v }))} />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantité en stock *</Label>
              <Input id="quantity" type="number" min="0" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: Number(e.target.value) }))} required />
            </div>
            <div>
              <Label htmlFor="minQuantity">Stock minimum *</Label>
              <Input id="minQuantity" type="number" min="0" value={formData.min_quantity} onChange={e => setFormData(p => ({ ...p, min_quantity: Number(e.target.value) }))} required />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? "Modification..." : "💾 Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
