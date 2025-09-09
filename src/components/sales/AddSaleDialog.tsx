import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";

export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    customer_name: "",
    customer_phone: "",
  });

  const { products } = useProducts();
  const { addSale } = useSales();

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const unitPrice = selectedProduct?.price || 0;
  const quantity = parseInt(formData.quantity) || 0;
  const totalAmount = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      await addSale.mutateAsync({
        product_id: formData.product_id,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        sale_date: new Date().toISOString(),
      });

      setFormData({
        product_id: "",
        quantity: "",
        customer_name: "",
        customer_phone: "",
      });
      setOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <div className="p-2 rounded-lg mr-3 bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground">Nouvelle vente</div>
            <div className="text-sm text-muted-foreground">Enregistrer une vente</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer une vente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Produit *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.price.toLocaleString()} FCFA (Stock: {product.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              min="1"
              max={selectedProduct?.quantity || 999}
              placeholder="1"
            />
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Stock disponible: {selectedProduct.quantity}
              </p>
            )}
          </div>

          {selectedProduct && quantity > 0 && (
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Prix unitaire:</span>
                <span>{unitPrice.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Quantité:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer_name">Nom du client</Label>
            <Input
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Téléphone du client</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={addSale.isPending || !selectedProduct || quantity <= 0}
            >
              {addSale.isPending ? "Enregistrement..." : "Enregistrer la vente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}