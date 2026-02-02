import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { WelcomeGuide } from "@/components/onboarding/WelcomeGuide";
import { BarChart3, Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { payments } = usePayments();
  const { user } = useAuth();

  // Check if user just confirmed email (from URL params)
  const urlParams = new URLSearchParams(window.location.search);
  const isEmailConfirmed = urlParams.get('confirmed') === 'true';
  
  // Check if user has seen the welcome guide (unique per user)
  const hasSeenWelcomeGuide = user?.id ? localStorage.getItem(`welcome-guide-seen-${user.id}`) === 'true' : false;
  
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
    }).reduce((sum, sale) => sum + sale.total_amount, 0);

    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalPayments = payments.reduce((sum, payment) => sum + payment.total_amount, 0);

    return {
      totalProducts,
      lowStockProducts,
      lowStockProductsList,
      totalSales,
      todaySales,
      pendingPayments,
      totalPayments,
    };
  }, [products, sales, payments]);

  // Auto-show welcome guide ONLY for new users who haven't seen it OR after email confirmation
  useEffect(() => {
    if (user?.id) {
      if (isEmailConfirmed || !hasSeenWelcomeGuide) {
        setShowWelcomeGuide(true);
        
        if (isEmailConfirmed) {
          window.history.replaceState(null, '', '/app');
        }
      }
    }
  }, [user?.id, hasSeenWelcomeGuide, isEmailConfirmed]);

  // Handle closing the welcome guide and mark as seen
  const handleCloseWelcomeGuide = () => {
    if (user?.id) {
      localStorage.setItem(`welcome-guide-seen-${user.id}`, 'true');
    }
    setShowWelcomeGuide(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Produits en stock"
          value={metrics.totalProducts.toString()}
          change={metrics.lowStockProducts > 0 ? `${metrics.lowStockProducts} en rupture` : "Stock normal"}
          changeType={metrics.lowStockProducts > 0 ? "negative" : "positive"}
          icon={Package}
          gradient="success"
        />
        <MetricCard
          title="Ventes aujourd'hui"
          value={`${metrics.todaySales.toLocaleString()} FCFA`}
          change="+12% vs hier"
          changeType="positive"
          icon={ShoppingCart}
          gradient="primary"
        />
        <MetricCard
          title="Paiements en attente"
          value={metrics.pendingPayments.toString()}
          change={`${metrics.pendingPayments} factures`}
          changeType="neutral"
          icon={Receipt}
          gradient="warning"
        />
        <MetricCard
          title="Chiffre d'affaires"
          value={`${metrics.totalPayments.toLocaleString()} FCFA`}
          change="+8% vs mois dernier"
          changeType="positive"
          icon={TrendingUp}
          gradient="primary"
        />
      </div>

      {/* Chiffre d'affaires dynamique */}
      <RevenueCard />

      {/* Low Stock Alert */}
      {metrics.lowStockProducts > 0 && (
        <div className="rounded-xl border-2 border-destructive/30 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Alerte Stock
                <span className="text-xs bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full font-semibold">
                  {metrics.lowStockProducts}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Produits nécessitant un réapprovisionnement urgent
              </p>
              
              <div className="flex flex-wrap gap-2">
                {metrics.lowStockProductsList.map((product) => (
                  <div 
                    key={product.id}
                    className="inline-flex items-center gap-2 bg-card rounded-lg px-3 py-2 border-2 border-border/60 text-sm hover:border-destructive/30 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                    <span className="font-semibold text-foreground">{product.name}</span>
                    <span className="text-muted-foreground font-medium">
                      {product.quantity}/{product.min_quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Guide Modal */}
      {showWelcomeGuide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <WelcomeGuide onClose={handleCloseWelcomeGuide} />
        </div>
      )}

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
