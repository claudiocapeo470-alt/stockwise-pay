import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function StockDashboard() {
  const { products } = useProducts();
  const navigate = useNavigate();

  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_quantity), [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Gestion des Stocks</h1><p className="text-sm text-muted-foreground">Aperçu de votre inventaire</p></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total produits</p><p className="text-2xl font-bold">{products.length}</p></div></CardContent></Card>
        <Card className={lowStock.length > 0 ? "border-destructive/30" : ""}><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Alertes rupture</p><p className="text-2xl font-bold">{lowStock.length}</p></div></CardContent></Card>
      </div>
      {lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Produits en alerte</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm text-destructive font-mono">{p.quantity}/{p.min_quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Button className="w-full h-12 gap-2" onClick={() => navigate('/app/stocks')}><Plus className="h-5 w-5" /> Gérer les stocks</Button>
    </div>
  );
}
