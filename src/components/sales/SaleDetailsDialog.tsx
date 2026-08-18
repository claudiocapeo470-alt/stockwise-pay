import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHead } from "@/components/ui/dialog-head";
import { Package, User, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Sale {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  quantity: number;
  sale_date: string;
  total_amount: number;
  unit_price: number;
  products?: {
    name: string;
    category?: string;
    sku?: string;
  };
}

interface SaleDetailsDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[14px] font-semibold text-right min-w-0 truncate">{value}</span>
    </div>
  );
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  if (!sale) return null;

  const formatPrice = (price: number) =>
    `${Math.round(price).toLocaleString("de-DE")} FCFA`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md rounded-2xl">
        <DialogHead icon={Package} title="Détails de la vente" subtitle={`Réf. ${sale.id.slice(0, 8)}`} />

        {/* Montant principal */}
        <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-4 text-center">
          <p className="text-[11px] uppercase tracking-wide opacity-70">Montant total</p>
          <p className="text-2xl font-bold leading-tight mt-1 tabular-nums">{formatPrice(sale.total_amount)}</p>
          <p className="text-[12px] opacity-80 mt-1 flex items-center justify-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(sale.sale_date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>

        {/* Produit */}
        <div className="rounded-2xl border border-border bg-card px-4 divide-y divide-border/60">
          <Row label="Produit" value={sale.products?.name || "Produit supprimé"} />
          {sale.products?.category && <Row label="Catégorie" value={sale.products.category} />}
          {sale.products?.sku && <Row label="SKU" value={sale.products.sku} />}
          <Row label="Quantité" value={sale.quantity} />
          <Row label="Prix unitaire" value={formatPrice(sale.unit_price)} />
        </div>

        {/* Client */}
        <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold truncate">{sale.customer_name || "Client anonyme"}</p>
            {sale.customer_phone && (
              <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {sale.customer_phone}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
