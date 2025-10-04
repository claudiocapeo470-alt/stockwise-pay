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
      <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-4 w-4" />
            Détails de la vente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sale Summary */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Résumé de la vente</h3>
                <Badge variant="secondary" className="text-xs">
                  ID: {sale.id.slice(0, 8)}...
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date de vente</p>
                    <p className="font-medium">
                      {format(new Date(sale.sale_date), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="font-medium text-primary text-lg">
                      {formatPrice(sale.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Informations client</h3>
              </div>
              
              <div className="space-y-1.5">
                <div>
                  <p className="text-sm text-muted-foreground">Nom du client</p>
                  <p className="font-medium">{sale.customer_name || "Client anonyme"}</p>
                </div>
                
                {sale.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{sale.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Informations produit</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom du produit</p>
                    <p className="font-medium">{sale.products?.name || "Produit supprimé"}</p>
                  </div>
                  
                  {sale.products?.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catégorie</p>
                      <Badge variant="outline">{sale.products.category}</Badge>
                    </div>
                  )}
                </div>
                
                {sale.products?.sku && (
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium">{sale.products.sku}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="font-medium text-lg">{sale.quantity}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Prix unitaire</p>
                    <p className="font-medium">{formatPrice(sale.unit_price)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold text-primary text-lg">
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