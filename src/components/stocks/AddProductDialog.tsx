import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { EmojiPicker, IconColorPicker, getIconBgStyle } from "./EmojiPicker";
import { MultiImageUpload } from "./MultiImageUpload";

const UNITS = ["pièce", "kg", "L", "m"];

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", quantity: "", min_quantity: "10",
    category: "", sku: "", icon_emoji: "📦", icon_bg_color: "bg-blue",
    image_url: "" as string | null, unit: "pièce",
    extraImages: [] as string[],
  });
  const { addProduct } = useProducts();

  const handleSubmit = async () => {
    try {
      // Use first extra image as main image_url if no main image set
      const mainImage = formData.image_url || formData.extraImages[0] || null;
      await addProduct.mutateAsync({
        name: formData.name, description: formData.description || null,
        price: parseFloat(formData.price) || 0, quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 10, category: formData.category || null,
        sku: formData.sku || null, icon_emoji: formData.icon_emoji, icon_bg_color: formData.icon_bg_color,
        image_url: mainImage,
      });
      // TODO: Save extra images to product_images table after product creation
      resetForm();
    } catch {}
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", quantity: "", min_quantity: "10", category: "", sku: "", icon_emoji: "📦", icon_bg_color: "bg-blue", image_url: null, unit: "pièce", extraImages: [] });
    setStep(1); setShowPicker(false); setOpen(false);
  };

  const canNext = (s: number) => {
    if (s === 1) return !!formData.name.trim();
    if (s === 2) return !!formData.price && !!formData.quantity;
    return true;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            s < step ? "bg-success text-success-foreground" : s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {s < step ? <Check className="h-4 w-4" /> : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-success" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(1); setShowPicker(false); } }}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-auto py-3 px-4 flex items-center justify-center gap-2 group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold text-sm">Ajouter produit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={getIconBgStyle(formData.icon_bg_color)}>
              <span className="text-2xl">{formData.icon_emoji}</span>
            </div>
            {step === 1 ? "Identité du produit" : step === 2 ? "Prix & Stock" : "Média & Détails"}
          </DialogTitle>
        </DialogHeader>
        <StepIndicator />
        <div className="space-y-3">
          {step === 1 && (
            <>
              <div><Label>Nom du produit *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: iPhone 14" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Catégorie</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Électronique" /></div>
                <div><Label>SKU</Label><Input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} placeholder="Optionnel" /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div><Label>Prix de vente (FCFA) *</Label><Input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} min="0" step="0.01" placeholder="0" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantité en stock *</Label><Input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} min="0" placeholder="0" /></div>
                <div><Label>Stock minimum</Label><Input type="number" value={formData.min_quantity} onChange={e => setFormData(p => ({ ...p, min_quantity: e.target.value }))} min="0" placeholder="10" /></div>
              </div>
              <div>
                <Label>Unité</Label>
                <Select value={formData.unit} onValueChange={v => setFormData(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              {/* Icon picker */}
              <div className="space-y-2">
                <Label>Icône du produit (optionnel)</Label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowPicker(!showPicker)} className="h-14 w-14 rounded-xl flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors" style={getIconBgStyle(formData.icon_bg_color)}>
                    <span className="text-3xl">{formData.icon_emoji}</span>
                  </button>
                  <p className="text-sm text-muted-foreground">Cliquez pour changer l'icône</p>
                </div>
                {showPicker && (
                  <div className="space-y-3 p-3 border border-border rounded-xl bg-card">
                    <EmojiPicker value={formData.icon_emoji} onChange={v => setFormData(p => ({ ...p, icon_emoji: v }))} />
                    <IconColorPicker value={formData.icon_bg_color} onChange={v => setFormData(p => ({ ...p, icon_bg_color: v }))} />
                  </div>
                )}
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
              <div><Label>Description (optionnel)</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Description détaillée du produit..." rows={3} /></div>
            </>
          )}
        </div>
        <div className="flex justify-between pt-3">
          <div>{step > 1 ? <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédent</Button> : <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>}</div>
          <div>{step < 3 ? <Button onClick={() => setStep(s => s + 1)} disabled={!canNext(step)} className="gap-1">Suivant <ChevronRight className="h-4 w-4" /></Button> : <Button onClick={handleSubmit} disabled={addProduct.isPending}>{addProduct.isPending ? "Ajout..." : "Enregistrer"}</Button>}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
