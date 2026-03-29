import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, AlertTriangle, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export function ManagerDashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { memberInfo } = useAuth();
  const firstName = memberInfo?.member_first_name || 'Manager';

  const metrics = useMemo(() => {
    const today = new Date();
    const todaySales = sales.filter(s => new Date(s.sale_date).toDateString() === today.toDateString());
    const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
    const lowStock = products.filter(p => p.quantity <= p.min_quantity);
    return { todaySales: todaySales.length, todayTotal, lowStock: lowStock.length };
  }, [sales, products]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center"><ShoppingCart className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Ventes du jour</p><p className="text-2xl font-bold">{metrics.todaySales}</p><p className="text-xs text-muted-foreground">{metrics.todayTotal.toLocaleString()} FCFA</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Alertes stock</p><p className="text-2xl font-bold">{metrics.lowStock}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total produits</p><p className="text-2xl font-bold">{products.length}</p></div></CardContent></Card>
      </div>
    </div>
  );
}
