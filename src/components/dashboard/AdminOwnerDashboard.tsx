import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Clock, ChevronRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeGuide, WELCOME_GUIDE_VERSION } from "@/components/onboarding/WelcomeGuide";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');

export function AdminOwnerDashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { payments } = usePayments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const isEmailConfirmed = urlParams.get('confirmed') === 'true';
  const storedVersion = user?.id ? localStorage.getItem(`welcome-guide-version-${user.id}`) : null;
  const isFirstLogin = user?.id ? (!storedVersion || storedVersion < WELCOME_GUIDE_VERSION) : false;
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStockProductsList = products.filter(p => p.quantity <= p.min_quantity);
    const lowStockProducts = lowStockProductsList.length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todaySales = sales.filter(sale => {
      const today = new Date();
      const saleDate = new Date(sale.sale_date);
      return saleDate.toDateString() === today.toDateString();
    });
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const now = new Date();
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    return { totalProducts, lowStockProducts, lowStockProductsList, totalSales, todaySales: todaySales.length, todayTotal, pendingPayments, monthlyRevenue };
  }, [products, sales, payments]);

  useEffect(() => {
    if (user?.id) {
      if (isEmailConfirmed && isFirstLogin) {
        setShowWelcomeGuide(true);
        window.history.replaceState(null, '', '/app');
      } else if (isFirstLogin && !isEmailConfirmed) {
        setShowWelcomeGuide(true);
      }
    }
  }, [user?.id, isFirstLogin, isEmailConfirmed]);

  const handleCloseWelcomeGuide = () => {
    if (user?.id) localStorage.setItem(`welcome-guide-version-${user.id}`, WELCOME_GUIDE_VERSION);
    setShowWelcomeGuide(false);
  };

  const recentSales = useMemo(() => [...sales].sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()).slice(0, 5), [sales]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Ventes aujourd'hui", value: fmt(metrics.todayTotal), unit: "FCFA", hint: `${metrics.todaySales} vente${metrics.todaySales > 1 ? "s" : ""}`, icon: ShoppingCart, tone: "text-success bg-success/10", to: "/app/ventes" },
          { label: "CA du mois", value: fmt(metrics.monthlyRevenue), unit: "FCFA", hint: format(new Date(), "MMMM yyyy", { locale: fr }), icon: TrendingUp, tone: "text-accent bg-accent/10", to: "/app/rapports" },
          { label: "Produits", value: String(metrics.totalProducts), unit: "", hint: metrics.lowStockProducts > 0 ? `${metrics.lowStockProducts} en stock bas` : "Stock normal", warn: metrics.lowStockProducts > 0, icon: Package, tone: "text-primary bg-primary/10", to: "/app/stocks" },
          { label: "Paiements en attente", value: String(metrics.pendingPayments), unit: "", hint: metrics.pendingPayments > 0 ? "À encaisser" : "Tout est réglé", icon: Receipt, tone: "text-warning bg-warning/10", to: "/app/paiements" },
        ].map((k) => (
          <button key={k.label} onClick={() => navigate(k.to)} className="group text-left rounded-lg border border-border bg-card p-4 sm:p-5 transition-all hover:border-accent/40 hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{k.label}</p>
              <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${k.tone}`}><k.icon className="h-4 w-4" /></div>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-foreground tabular-nums truncate">{k.value}{k.unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{k.unit}</span>}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs ${k.warn ? "text-destructive" : "text-muted-foreground"}`}>
              {k.warn ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />}{k.hint}
            </p>
          </button>
        ))}
      </div>

      {metrics.lowStockProducts > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-destructive/10 flex items-center justify-center flex-shrink-0 rounded-xl"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-foreground">Produits à réapprovisionner</h3><Badge variant="destructive">{metrics.lowStockProducts}</Badge></div>
                <div className="flex flex-wrap gap-2">
                  {metrics.lowStockProductsList.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center gap-2 bg-background px-3 py-1.5 border border-border text-sm rounded-lg"><span className="font-medium">{product.name}</span><span className="text-muted-foreground">{product.quantity}/{product.min_quantity}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-base">Actions rapides</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start h-11 rounded-lg" onClick={() => navigate('/app/caisse')}><Plus className="h-4 w-4 mr-3" />Nouvelle vente</Button>
            <Button variant="outline" className="w-full justify-start h-11 rounded-lg" onClick={() => navigate('/app/stocks')}><Package className="h-4 w-4 mr-3" />Ajouter un produit</Button>
            <Button variant="outline" className="w-full justify-start h-11 rounded-lg" onClick={() => navigate('/app/factures/new')}><Receipt className="h-4 w-4 mr-3" />Créer une facture</Button>
            <Button variant="outline" className="w-full justify-start h-11 rounded-lg" onClick={() => navigate('/app/rapports')}><TrendingUp className="h-4 w-4 mr-3" />Voir les rapports</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between"><CardTitle className="text-base">Activité récente</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate('/app/ventes')}>Voir tout <ChevronRight className="h-4 w-4 ml-1" /></Button></CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8"><Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Aucune activité récente</p></div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 bg-muted flex items-center justify-center rounded-lg"><ShoppingCart className="h-4 w-4 text-muted-foreground" /></div><div><p className="font-medium text-sm">{(sale as any).products?.name || 'Produit'}</p><p className="text-xs text-muted-foreground">{format(new Date(sale.sale_date), "dd MMM à HH:mm", { locale: fr })}</p></div></div>
                    <div className="text-right"><p className="font-semibold text-sm">{sale.total_amount.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')} FCFA</p><p className="text-xs text-muted-foreground">Qté: {sale.quantity}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showWelcomeGuide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WelcomeGuide onClose={handleCloseWelcomeGuide} />
        </div>
      )}
    </div>
  );
}
