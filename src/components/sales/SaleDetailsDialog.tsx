import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Package, Phone, Calendar, CreditCard } from "lucide-react";
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

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  if (!sale) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Détails de la vente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 pt-2">
          {/* Sale Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm sm:text-base font-semibold">Résumé de la vente</h3>
                <Badge variant="secondary" className="text-xs w-fit">
                  ID: {sale.id.slice(0, 8)}...
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Date de vente</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {format(new Date(sale.sale_date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Montant total</p>
                    <p className="font-bold text-primary text-base sm:text-lg break-words">
                      {formatPrice(sale.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border-accent/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">Informations client</h3>
              </div>
              
              <div className="space-y-2 sm:space-y-2.5">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Nom du client</p>
                  <p className="font-medium text-sm sm:text-base break-words">{sale.customer_name || "Client anonyme"}</p>
                </div>
                
                {sale.customer_phone && (
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium text-sm sm:text-base break-words">{sale.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="border-success/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-success/10">
                  <Package className="h-4 w-4 text-success" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">Informations produit</h3>
              </div>
              
              <div className="space-y-3 sm:space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Nom du produit</p>
                    <p className="font-medium text-sm sm:text-base break-words">{sale.products?.name || "Produit supprimé"}</p>
                  </div>
                  
                  {sale.products?.category && (
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Catégorie</p>
                      <Badge variant="outline" className="text-xs sm:text-sm">{sale.products.category}</Badge>
                    </div>
                  )}
                </div>
                
                {sale.products?.sku && (
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium text-sm sm:text-base break-words">{sale.products.sku}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Quantité</p>
                    <p className="font-bold text-base sm:text-lg">{sale.quantity}</p>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Prix unit.</p>
                    <p className="font-medium text-sm sm:text-base break-words">{formatPrice(sale.unit_price)}</p>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="font-bold text-primary text-base sm:text-lg break-words">
                      {formatPrice(sale.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}