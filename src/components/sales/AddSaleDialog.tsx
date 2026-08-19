import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { DialogHead } from "@/components/ui/dialog-head";
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

    const createdIds: string[] = [];
    try {
      for (const line of lines) {
        const product = products.find(p => p.id === line.product_id);
        if (!product) continue;

        const result: any = await addSale.mutateAsync({
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
        if (result?.id) createdIds.push(result.id);
      }

      setLines([{ product_id: "", quantity: 1 }]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("");
      setOpen(false);
    } catch (error) {
      // Rollback partially-created sales to avoid inconsistent state
      if (createdIds.length > 0) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('sales').delete().in('id', createdIds);
        } catch {
          // best-effort rollback
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium hover:shadow-glow transition-all duration-300 rounded-xl h-11 px-5 flex items-center justify-center gap-2 group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold text-sm">Nouvelle vente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-5">
        <DialogHead icon={ShoppingCart} title="Enregistrer une vente" subtitle="Client, produits et paiement" />
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name" className="text-xs text-muted-foreground">Client</Label>
              <Input id="customer_name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Jean Dupont" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone" className="text-xs text-muted-foreground">Téléphone</Label>
              <Input id="customer_phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+225 07..." className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Produits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Produits</Label>
              <button type="button" onClick={addLine} className="text-xs font-semibold text-primary flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>

            {lines.map((line, index) => {
              const selectedProduct = products.find(p => p.id === line.product_id);
              const lineTotal = getLineTotal(line);
              return (
                <div key={index} className="rounded-2xl border border-border/60 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Select value={line.product_id} onValueChange={v => updateLine(index, 'product_id', v)}>
                      <SelectTrigger className="h-11 rounded-xl flex-1 text-sm">
                        <SelectValue placeholder="Choisir un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id} disabled={lines.some((l, i) => i !== index && l.product_id === p.id)}>
                            {p.name} — {formatCurrency(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lines.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive shrink-0" onClick={() => removeLine(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Qté</span>
                      <Input
                        type="number" min="1" max={selectedProduct?.quantity || 999}
                        value={line.quantity} onChange={e => updateLine(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="h-9 w-16 rounded-xl text-center text-sm"
                      />
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(lineTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mode de paiement — pastilles */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Mode de paiement</Label>
            <div className="flex flex-wrap gap-2">
              {["Espèces", "Mobile Money", "Carte bancaire", "Virement", "Chèque", "Autre"].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-3.5 h-9 rounded-full text-xs font-semibold border transition-colors ${
                    paymentMethod === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Total + actions */}
          <div className="pt-2 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-full" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" className="flex-1 h-12 rounded-full" disabled={addSale.isPending || !isValid}>
                {addSale.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

    </Dialog>
  );
}
