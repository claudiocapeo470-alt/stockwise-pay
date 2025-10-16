import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    min_quantity: "10",
    category: "",
    sku: "",
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
      });

      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        min_quantity: "10",
        category: "",
        sku: "",
      });
      setOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-4 hover:bg-accent"
        >
          <div className="p-2 rounded-lg mr-3 bg-success dark:bg-gradient-success hover:opacity-90">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground dark:text-foreground">Ajouter produit</div>
            <div className="text-sm text-gray-700 dark:text-muted-foreground">Ajouter au stock</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Nouveau produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ex: iPhone 14"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description détaillée du produit"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Stock minimum</Label>
              <Input
                id="min_quantity"
                name="min_quantity"
                type="number"
                value={formData.min_quantity}
                onChange={handleInputChange}
                min="0"
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Électronique"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU/Code produit</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Ex: IPH14-128GB-BLK"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={addProduct.isPending}>
              {addProduct.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}