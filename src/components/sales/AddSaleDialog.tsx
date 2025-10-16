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
    payment_method: "",
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
        paid_amount: totalAmount,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        payment_method: formData.payment_method,
        sale_date: new Date().toISOString(),
      });

      setFormData({
        product_id: "",
        quantity: "",
        customer_name: "",
        customer_phone: "",
        payment_method: "",
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
          <div className="p-2 rounded-lg mr-3 bg-primary dark:bg-primary hover:opacity-90">
            <Plus className="h-4 w-4 text-white dark:text-primary-foreground" />
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground dark:text-foreground">Nouvelle vente</div>
            <div className="text-sm text-gray-700 dark:text-muted-foreground">Enregistrer une vente</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Enregistrer une vente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
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
            <div className="bg-muted p-2 rounded-lg space-y-1 text-sm">
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

          <div className="space-y-2">
            <Label htmlFor="payment_method">Mode de paiement *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={addSale.isPending || !selectedProduct || quantity <= 0 || !formData.payment_method}
            >
              {addSale.isPending ? "Enregistrement..." : "Enregistrer la vente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}