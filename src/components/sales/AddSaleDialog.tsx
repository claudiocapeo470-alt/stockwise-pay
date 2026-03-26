import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useCurrency } from "@/hooks/useCurrency";

interface CartLine {
  product_id: string;
  quantity: number;
}

export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([{ product_id: "", quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const { products } = useProducts();
  const { addSale } = useSales();
  const { formatCurrency } = useCurrency();

  const getLineTotal = (line: CartLine) => {
    const product = products.find(p => p.id === line.product_id);
    return (product?.price || 0) * (line.quantity || 0);
  };

  const grandTotal = lines.reduce((sum, l) => sum + getLineTotal(l), 0);

  const addLine = () => setLines(prev => [...prev, { product_id: "", quantity: 1 }]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof CartLine, value: string | number) => {
    setLines(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const isValid = lines.every(l => l.product_id && l.quantity > 0) && paymentMethod;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      for (const line of lines) {
        const product = products.find(p => p.id === line.product_id);
        if (!product) continue;

        await addSale.mutateAsync({
          product_id: line.product_id,
          quantity: line.quantity,
          unit_price: product.price,
          total_amount: product.price * line.quantity,
          paid_amount: product.price * line.quantity,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          payment_method: paymentMethod,
          sale_date: new Date().toISOString(),
        });
      }

      setLines([{ product_id: "", quantity: 1 }]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("");
      setOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-auto py-3 px-4 sm:py-3.5 sm:px-5 flex items-center justify-center gap-2 sm:gap-3 group">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
            <span className="font-semibold text-sm sm:text-base">Nouvelle vente</span>
            <span className="hidden sm:inline text-xs sm:text-sm opacity-90">•</span>
            <span className="text-xs sm:text-sm opacity-90">Multi-produits</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Enregistrer une vente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="customer_name" className="text-xs">Nom du client</Label>
              <Input id="customer_name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Jean Dupont" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="customer_phone" className="text-xs">Téléphone</Label>
              <Input id="customer_phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+225 07..." className="h-9" />
            </div>
          </div>

          {/* Product lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Produits *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            </div>

            {lines.map((line, index) => {
              const selectedProduct = products.find(p => p.id === line.product_id);
              const lineTotal = getLineTotal(line);
              return (
                <div key={index} className="flex items-end gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Produit</Label>
                    <Select value={line.product_id} onValueChange={v => updateLine(index, 'product_id', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id} disabled={lines.some((l, i) => i !== index && l.product_id === p.id)}>
                            {p.name} — {formatCurrency(p.price)} (Stock: {p.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-16 space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Qté</Label>
                    <Input
                      type="number" min="1" max={selectedProduct?.quantity || 999}
                      value={line.quantity} onChange={e => updateLine(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="h-8 text-xs text-center"
                    />
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-xs font-semibold">{formatCurrency(lineTotal)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLine(index)} disabled={lines.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Total */}
          {grandTotal > 0 && (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold text-sm">Total</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          )}

          {/* Payment method */}
          <div className="space-y-1">
            <Label className="text-xs">Mode de paiement *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionner..." />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addSale.isPending || !isValid}>
              {addSale.isPending ? "Enregistrement..." : `Enregistrer (${lines.length} produit${lines.length > 1 ? 's' : ''})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
