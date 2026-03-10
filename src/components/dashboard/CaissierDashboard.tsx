import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, ShoppingCart, TrendingUp } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function CaissierDashboard() {
  const { sales } = useSales();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const today = new Date();
    const todaySales = sales.filter(s => new Date(s.sale_date).toDateString() === today.toDateString());
    return { count: todaySales.length, total: todaySales.reduce((s, v) => s + v.total_amount, 0), avg: todaySales.length ? todaySales.reduce((s, v) => s + v.total_amount, 0) / todaySales.length : 0 };
  }, [sales]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Bienvenue, Caissier</h1><p className="text-sm text-muted-foreground">Vos statistiques du jour</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 text-center"><TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-3xl font-bold">{metrics.total.toLocaleString()}</p><p className="text-sm text-muted-foreground">FCFA encaissés</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><ShoppingCart className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-3xl font-bold">{metrics.count}</p><p className="text-sm text-muted-foreground">Transactions</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" /><p className="text-3xl font-bold">{Math.round(metrics.avg).toLocaleString()}</p><p className="text-sm text-muted-foreground">Panier moyen FCFA</p></CardContent></Card>
      </div>
      <Button size="lg" className="w-full h-14 text-lg gap-3" onClick={() => navigate('/app/caisse')}><Scan className="h-6 w-6" /> Ouvrir la Caisse</Button>
    </div>
  );
}
