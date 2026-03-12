import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { EmojiPicker, IconColorPicker, getIconBgStyle } from "./EmojiPicker";
import { MultiImageUpload } from "./MultiImageUpload";

interface Product { id: string; name: string; description?: string; price: number; quantity: number; min_quantity: number; category?: string; sku?: string; icon_emoji?: string; icon_bg_color?: string; image_url?: string | null; }
interface EditProductDialogProps { product: Product | null; open: boolean; onOpenChange: (open: boolean) => void; }

const UNITS = ["pièce", "kg", "L", "m"];

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const { updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "", description: product?.description || "", price: product?.price || 0,
    quantity: product?.quantity || 0, min_quantity: product?.min_quantity || 10, category: product?.category || "",
    sku: product?.sku || "", icon_emoji: product?.icon_emoji || "📦", icon_bg_color: product?.icon_bg_color || "bg-blue",
    image_url: product?.image_url || null, unit: "pièce",
    extraImages: (product?.image_url ? [product.image_url] : []) as string[],
  });

  const handleSubmit = async () => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const mainImage = formData.extraImages[0] || formData.image_url || null;
      await updateProduct.mutateAsync({ id: product.id, name: formData.name, description: formData.description, price: Number(formData.price), quantity: Number(formData.quantity), min_quantity: Number(formData.min_quantity), category: formData.category, sku: formData.sku, icon_emoji: formData.icon_emoji, icon_bg_color: formData.icon_bg_color, image_url: mainImage });
      onOpenChange(false);
      toast.success("Produit modifié avec succès");
    } catch { toast.error("Erreur"); } finally { setIsSubmitting(false); }
  };

  React.useEffect(() => {
    if (product) {
      setFormData({ name: product.name || "", description: product.description || "", price: product.price || 0, quantity: product.quantity || 0, min_quantity: product.min_quantity || 10, category: product.category || "", sku: product.sku || "", icon_emoji: product.icon_emoji || "📦", icon_bg_color: product.icon_bg_color || "bg-blue", image_url: product.image_url || null, unit: "pièce", extraImages: product.image_url ? [product.image_url] : [] });
      setStep(1); setShowPicker(false);
    }
  }, [product]);

  if (!product) return null;

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s < step ? "bg-success text-success-foreground" : s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {s < step ? <Check className="h-4 w-4" /> : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-success" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={getIconBgStyle(formData.icon_bg_color)}><span className="text-2xl">{formData.icon_emoji}</span></div>
            {step === 1 ? "Identité" : step === 2 ? "Prix & Stock" : "Média & Détails"}
          </DialogTitle>
        </DialogHeader>
        <StepIndicator />
        <div className="space-y-3">
          {step === 1 && (<>
            <div><Label>Nom *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Catégorie</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
              <div><Label>SKU</Label><Input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} /></div>
            </div>
          </>)}
          {step === 2 && (<>
            <div><Label>Prix (FCFA) *</Label><Input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantité *</Label><Input type="number" min="0" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: Number(e.target.value) }))} /></div>
              <div><Label>Stock minimum</Label><Input type="number" min="0" value={formData.min_quantity} onChange={e => setFormData(p => ({ ...p, min_quantity: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Unité</Label><Select value={formData.unit} onValueChange={v => setFormData(p => ({ ...p, unit: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
          </>)}
          {step === 3 && (<>
            {/* Icon picker */}
            <div className="space-y-2">
              <Label>Icône (optionnel)</Label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowPicker(!showPicker)} className="h-14 w-14 rounded-xl flex items-center justify-center border-2 border-dashed border-border hover:border-primary" style={getIconBgStyle(formData.icon_bg_color)}><span className="text-3xl">{formData.icon_emoji}</span></button>
              </div>
              {showPicker && (<div className="space-y-3 p-3 border border-border rounded-xl bg-card"><EmojiPicker value={formData.icon_emoji} onChange={v => setFormData(p => ({ ...p, icon_emoji: v }))} /><IconColorPicker value={formData.icon_bg_color} onChange={v => setFormData(p => ({ ...p, icon_bg_color: v }))} /></div>)}
            </div>

            {/* Multiple images */}
            <div className="space-y-2">
              <Label>Photos du produit (optionnel)</Label>
              <MultiImageUpload
                images={formData.extraImages}
                onImagesChange={imgs => setFormData(p => ({ ...p, extraImages: imgs, image_url: imgs[0] || null }))}
                maxImages={5}
              />
            </div>

            {/* Description */}
            <div><Label>Description (optionnel)</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
          </>)}
        </div>
        <div className="flex justify-between pt-3">
          <div>{step > 1 ? <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédent</Button> : <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>}</div>
          <div>{step < 3 ? <Button onClick={() => setStep(s => s + 1)} className="gap-1">Suivant <ChevronRight className="h-4 w-4" /></Button> : <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Modification..." : "💾 Enregistrer"}</Button>}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
