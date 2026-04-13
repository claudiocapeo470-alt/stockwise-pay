import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertTriangle, Package, TrendingUp, ArrowUp, ArrowDown, BarChart3, Users } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ManagerDashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { memberInfo } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const firstName = memberInfo?.member_first_name || 'Manager';

  const metrics = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySales = sales.filter(s => new Date(s.sale_date).toDateString() === today.toDateString());
    const yesterdaySales = sales.filter(s => new Date(s.sale_date).toDateString() === yesterday.toDateString());
    const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
    const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + s.total_amount, 0);
    const trend = yesterdayTotal > 0 ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : 0;
    const avg = todaySales.length ? Math.round(todayTotal / todaySales.length) : 0;
    const lowStock = products.filter(p => p.quantity <= p.min_quantity);

    return { todaySales: todaySales.length, todayTotal, lowStock: lowStock.length, trend, avg };
  }, [sales, products]);

  // Last 7 days chart data
  const chartData = useMemo(() => {
    const days: { name: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const daySales = sales.filter(s => new Date(s.sale_date).toDateString() === d.toDateString());
      days.push({
        name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        total: daySales.reduce((s, v) => s + v.total_amount, 0),
      });
    }
    return days;
  }, [sales]);

  // Top 5 products this month
  const topProducts = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = sales.filter(s => new Date(s.sale_date) >= monthStart);
    const productMap = new Map<string, { name: string; qty: number; total: number }>();
    monthSales.forEach(s => {
      const prod = products.find(p => p.id === s.product_id);
      const name = prod?.name || 'Produit inconnu';
      const existing = productMap.get(s.product_id) || { name, qty: 0, total: 0 };
      existing.qty += s.quantity;
      existing.total += s.total_amount;
      productMap.set(s.product_id, existing);
    });
    return Array.from(productMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [sales, products]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <TrendingUp className="h-5 w-5 text-primary mb-2" />
          <p className="text-xl font-bold">{formatCurrency(metrics.todayTotal)}</p>
          <p className="text-xs text-muted-foreground">CA du jour</p>
          {metrics.trend !== 0 && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${metrics.trend > 0 ? 'text-green-500' : 'text-destructive'}`}>
              {metrics.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(metrics.trend)}%
            </div>
          )}
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <ShoppingCart className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-xl font-bold">{metrics.todaySales}</p>
          <p className="text-xs text-muted-foreground">Ventes du jour</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Package className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-xl font-bold">{formatCurrency(metrics.avg)}</p>
          <p className="text-xs text-muted-foreground">Panier moyen</p>
        </CardContent></Card>
        <Card className={metrics.lowStock > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-xl font-bold">{metrics.lowStock}</p>
            <p className="text-xs text-muted-foreground">Alertes stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Ventes (7 derniers jours)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top 5 Produits (ce mois)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(p.total)}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} vendus</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" className="h-12 gap-2 text-xs" onClick={() => navigate('/app/ventes')}>
          <ShoppingCart className="h-4 w-4" /> Ventes
        </Button>
        <Button variant="outline" className="h-12 gap-2 text-xs" onClick={() => navigate('/app/stocks')}>
          <Package className="h-4 w-4" /> Stocks
        </Button>
        <Button variant="outline" className="h-12 gap-2 text-xs" onClick={() => navigate('/app/rapport-employes')}>
          <Users className="h-4 w-4" /> Employés
        </Button>
      </div>
    </div>
  );
}
