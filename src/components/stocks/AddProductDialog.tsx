import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Package, Tag, Image as ImageIcon } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { EmojiPicker, IconColorPicker, getIconBgStyle } from "./EmojiPicker";
import { MultiImageUpload } from "./MultiImageUpload";
import { DialogHead } from "@/components/ui/dialog-head";

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

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(1); setShowPicker(false); } }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-11 px-5 flex items-center justify-center gap-2 group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold text-sm">Ajouter produit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[88vh] flex flex-col gap-0 p-4 sm:p-6 rounded-2xl">
        <DialogHead
          icon={step === 1 ? Package : step === 2 ? Tag : ImageIcon}
          title={step === 1 ? "Nouveau produit · Identité" : step === 2 ? "Nouveau produit · Prix & stock" : "Nouveau produit · Média"}
          subtitle={step === 1 ? "Nom, catégorie et référence" : step === 2 ? "Prix, quantités et unité" : "Photos et description"}
          step={step}
          totalSteps={3}
        />

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3 [&_label]:text-[13px] [&_label]:font-medium [&_input]:h-11 [&_input]:rounded-xl [&_button[role=combobox]]:h-11 [&_button[role=combobox]]:rounded-xl">
          {step === 1 && (
            <>
              <div className="space-y-1.5"><Label>Nom du produit *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: iPhone 14" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Catégorie</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Électronique" /></div>
                <div className="space-y-1.5"><Label>SKU</Label><Input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} placeholder="Optionnel" /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-1.5"><Label>Prix de vente (FCFA) *</Label><Input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} min="0" step="0.01" placeholder="0" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Quantité en stock *</Label><Input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} min="0" placeholder="0" /></div>
                <div className="space-y-1.5"><Label>Stock minimum</Label><Input type="number" value={formData.min_quantity} onChange={e => setFormData(p => ({ ...p, min_quantity: e.target.value }))} min="0" placeholder="10" /></div>
              </div>
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label>Photos du produit (optionnel)</Label>
                <MultiImageUpload
                  images={formData.extraImages}
                  onImagesChange={imgs => setFormData(p => ({ ...p, extraImages: imgs, image_url: imgs[0] || null }))}
                  maxImages={5}
                />
              </div>

              <div className="space-y-1.5"><Label>Description (optionnel)</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Description détaillée du produit..." rows={3} className="rounded-xl" /></div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 pt-3 mt-1 border-t border-border/60 [&_button]:h-11 [&_button]:flex-1 [&_button]:rounded-xl">
          {step > 1 ? <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédent</Button> : <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>}
          {step < 3 ? <Button onClick={() => setStep(s => s + 1)} disabled={!canNext(step)} className="gap-1">Suivant <ChevronRight className="h-4 w-4" /></Button> : <Button onClick={handleSubmit} disabled={addProduct.isPending}>{addProduct.isPending ? "Ajout..." : "Enregistrer"}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
