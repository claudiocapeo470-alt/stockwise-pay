import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ClipboardList, ShoppingBag, FileText, FileCheck, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useOnlineStore, useStoreOrders } from "@/hooks/useOnlineStore";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function FusionDashboard() {
  const { products } = useProducts();
  const { memberInfo } = useAuth();
  const { store } = useOnlineStore();
  const { orders } = useStoreOrders(store?.id);
  const navigate = useNavigate();
  const firstName = memberInfo?.member_first_name || 'Gestionnaire';
  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_quantity), [products]);
  const pending = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Gestion Stock & Boutique</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">Produits en stock</p>
          </CardContent>
        </Card>
        <Card className={lowStock.length > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold">{lowStock.length}</p>
            <p className="text-xs text-muted-foreground">Alertes stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ClipboardList className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Commandes en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ShoppingBag className="h-5 w-5 text-violet-500 mb-2" />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Total commandes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/stocks')}>
          <Package className="h-4 w-4" /> Stocks
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/commandes')}>
          <ClipboardList className="h-4 w-4" /> Commandes
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/produits')}>
          <ShoppingBag className="h-4 w-4" /> Boutique
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/factures')}>
          <FileText className="h-4 w-4" /> Factures
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/devis')}>
          <FileCheck className="h-4 w-4" /> Devis
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/livraisons')}>
          <Truck className="h-4 w-4" /> Livraisons
        </Button>
      </div>
    </div>
  );
}