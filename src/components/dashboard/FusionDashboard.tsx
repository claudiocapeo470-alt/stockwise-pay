import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ClipboardList, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function FusionDashboard() {
  const { products } = useProducts();
  const navigate = useNavigate();
  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_quantity), [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Dashboard Fusionné</h1><p className="text-sm text-muted-foreground">Stocks & Commandes en un coup d'œil</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Produits</p><p className="text-2xl font-bold">{products.length}</p></div></CardContent></Card>
        <Card className={lowStock.length > 0 ? "border-destructive/30" : ""}><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Alertes stock</p><p className="text-2xl font-bold">{lowStock.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-warning/10 rounded-xl flex items-center justify-center"><ClipboardList className="h-6 w-6 text-warning" /></div><div><p className="text-sm text-muted-foreground">Commandes</p><p className="text-2xl font-bold">—</p></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12" onClick={() => navigate('/app/stocks')}><Package className="h-4 w-4 mr-2" /> Stocks</Button>
        <Button variant="outline" className="h-12" onClick={() => navigate('/app/boutique/commandes')}><ClipboardList className="h-4 w-4 mr-2" /> Commandes</Button>
      </div>
    </div>
  );
}
