import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { EmojiPicker, IconColorPicker, getIconBgStyle } from "./EmojiPicker";
import { ImageCropUpload } from "./ImageCropUpload";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    min_quantity: "10",
    category: "",
    sku: "",
    icon_emoji: "📦",
    icon_bg_color: "bg-blue",
    image_url: "" as string | null,
  });

  const { addProduct } = useProducts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 10,
        category: formData.category || null,
        sku: formData.sku || null,
        icon_emoji: formData.icon_emoji,
        icon_bg_color: formData.icon_bg_color,
        image_url: formData.image_url || null,
      });
      setFormData({ name: "", description: "", price: "", quantity: "", min_quantity: "10", category: "", sku: "", icon_emoji: "📦", icon_bg_color: "bg-blue", image_url: null });
      setShowPicker(false);
      setOpen(false);
    } catch (error) {}
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-auto py-3 px-4 sm:py-3.5 sm:px-5 flex items-center justify-center gap-2 sm:gap-3 group">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
            <span className="font-semibold text-sm sm:text-base">Ajouter produit</span>
            <span className="hidden sm:inline text-xs sm:text-sm opacity-90">•</span>
            <span className="text-xs sm:text-sm opacity-90">Ajouter au stock</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={getIconBgStyle(formData.icon_bg_color)}>
              <span className="text-2xl">{formData.icon_emoji}</span>
            </div>
            Nouveau produit
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
                <p className="text-sm font-medium">Choisir une icône</p>
                <p className="text-xs text-muted-foreground">Cliquez pour sélectionner</p>
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

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: iPhone 14" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Description détaillée du produit" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required min="0" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Stock minimum</Label>
              <Input id="min_quantity" name="min_quantity" type="number" value={formData.min_quantity} onChange={handleInputChange} min="0" placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" name="category" value={formData.category} onChange={handleInputChange} placeholder="Ex: Électronique" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU/Code produit</Label>
            <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Ex: IPH14-128GB-BLK" />
          </div>

          <div className="space-y-2">
            <Label>Photo du produit</Label>
            <ImageCropUpload currentImageUrl={formData.image_url} onImageUploaded={url => setFormData(p => ({ ...p, image_url: url }))} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addProduct.isPending}>{addProduct.isPending ? "Ajout..." : "Ajouter"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
