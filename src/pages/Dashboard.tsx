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

export default function Dashboard() {
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
    const totalPayments = payments.reduce((sum, payment) => sum + payment.total_amount, 0);

    // Calcul CA mensuel
    const now = new Date();
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    return {
      totalProducts,
      lowStockProducts,
      lowStockProductsList,
      totalSales,
      todaySales: todaySales.length,
      todayTotal,
      pendingPayments,
      totalPayments,
      monthlyRevenue,
    };
  }, [products, sales, payments]);

  useEffect(() => {
    if (user?.id) {
      // Only show on first login (email confirmed or never seen guide)
      if (isEmailConfirmed && isFirstLogin) {
        setShowWelcomeGuide(true);
        window.history.replaceState(null, '', '/app');
      } else if (isFirstLogin && !isEmailConfirmed) {
        // First time accessing dashboard after signup
        setShowWelcomeGuide(true);
      }
    }
  }, [user?.id, isFirstLogin, isEmailConfirmed]);

  const handleCloseWelcomeGuide = () => {
    if (user?.id) {
      localStorage.setItem(`welcome-guide-version-${user.id}`, WELCOME_GUIDE_VERSION);
    }
    setShowWelcomeGuide(false);
  };

  // Activité récente
  const recentSales = useMemo(() => {
    return [...sales].sort((a, b) => 
      new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
    ).slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards - 4 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Produits en stock */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Produits en stock</p>
                <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalProducts}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metrics.lowStockProducts > 0 ? (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">{metrics.lowStockProducts} en rupture</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      <span className="text-sm text-success font-medium">Stock normal</span>
                    </>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ventes aujourd'hui */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Ventes aujourd'hui</p>
                <p className="text-3xl font-bold text-foreground mt-1">{metrics.todaySales}</p>
                <p className="text-sm text-muted-foreground mt-2">{metrics.todayTotal.toLocaleString()} FCFA</p>
              </div>
              <div className="h-12 w-12 bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paiements en attente */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Paiements en attente</p>
                <p className="text-3xl font-bold text-foreground mt-1">{metrics.pendingPayments}</p>
                <p className="text-sm text-muted-foreground mt-2">{metrics.pendingPayments} factures</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CA mensuel */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">CA du mois</p>
                <p className="text-3xl font-bold text-foreground mt-1">{(metrics.monthlyRevenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground mt-2">{metrics.monthlyRevenue.toLocaleString()} FCFA</p>
              </div>
              <div className="h-12 w-12 bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerte Stock */}
      {metrics.lowStockProducts > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">Alerte Stock</h3>
                  <Badge variant="destructive">{metrics.lowStockProducts}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Produits nécessitant un réapprovisionnement</p>
                <div className="flex flex-wrap gap-2">
                  {metrics.lowStockProductsList.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center gap-2 bg-background px-3 py-1.5 border border-border text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground">{product.quantity}/{product.min_quantity}</span>
                    </div>
                  ))}
                  {metrics.lowStockProductsList.length > 5 && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/app/stocks')}>
                      +{metrics.lowStockProductsList.length - 5} autres
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/caisse')}
            >
              <Plus className="h-4 w-4 mr-3" />
              Nouvelle vente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/stocks')}
            >
              <Package className="h-4 w-4 mr-3" />
              Ajouter un produit
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/facturation')}
            >
              <Receipt className="h-4 w-4 mr-3" />
              Créer une facture
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/performance')}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Voir les rapports
            </Button>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Activité récente</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/ventes')}>
              Voir tout <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sale.products?.name || 'Produit'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.sale_date), "dd MMM à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{sale.total_amount.toLocaleString()} FCFA</p>
                      <p className="text-xs text-muted-foreground">Qté: {sale.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Welcome Guide Modal */}
      {showWelcomeGuide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WelcomeGuide onClose={handleCloseWelcomeGuide} />
        </div>
      )}
    </div>
  );
}
