import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Plus, Truck, FileText, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function StockDashboard() {
  const { products } = useProducts();
  const { invoices } = useInvoices('facture');
  const navigate = useNavigate();

  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_quantity), [products]);
  const outOfStock = useMemo(() => products.filter(p => p.quantity === 0), [products]);
  const recentInvoices = useMemo(() => (invoices || []).slice(0, 3), [invoices]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
        <p className="text-sm text-muted-foreground">Aperçu de votre inventaire</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <Package className="h-5 w-5 text-primary mb-2" />
          <p className="text-xl font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground">Total produits</p>
        </CardContent></Card>
        <Card className={outOfStock.length > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-xl font-bold">{outOfStock.length}</p>
            <p className="text-xs text-muted-foreground">En rupture</p>
          </CardContent>
        </Card>
        <Card className={lowStock.length > 0 ? 'border-orange-500/30' : ''}>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-xl font-bold">{lowStock.length}</p>
            <p className="text-xs text-muted-foreground">Sous seuil</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-4">
          <FileText className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-xl font-bold">{invoices?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Factures</p>
        </CardContent></Card>
      </div>

      {/* Low stock products */}
      {lowStock.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Produits en alerte</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg ${p.quantity === 0 ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                <span className="text-sm font-medium">{p.icon_emoji} {p.name}</span>
                <Badge variant={p.quantity === 0 ? 'destructive' : 'outline'} className={p.quantity > 0 ? 'border-orange-500 text-orange-500' : ''}>
                  {p.quantity}/{p.min_quantity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent invoices */}
      {recentInvoices.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dernières factures</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{inv.document_number}</p>
                  <p className="text-xs text-muted-foreground">{inv.client_name}</p>
                </div>
                <Badge variant={inv.status === 'paye' ? 'default' : 'secondary'}>
                  {inv.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button className="h-12 gap-2 text-xs" onClick={() => navigate('/app/stocks')}>
          <Plus className="h-4 w-4" /> Stocks
        </Button>
        <Button variant="outline" className="h-12 gap-2 text-xs" onClick={() => navigate('/app/factures/new')}>
          <FileText className="h-4 w-4" /> Facture
        </Button>
        <Button variant="outline" className="h-12 gap-2 text-xs" onClick={() => navigate('/app/livraisons')}>
          <Truck className="h-4 w-4" /> Livraisons
        </Button>
      </div>
    </div>
  );
}
