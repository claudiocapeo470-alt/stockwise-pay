import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WelcomeGuide } from "@/components/onboarding/WelcomeGuide";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BarChart3, Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import stocknixLogo from "@/assets/stocknix-logo.png";

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
      // Show guide if user confirmed email OR if they never saw it before
      if (isEmailConfirmed || !hasSeenWelcomeGuide) {
        setShowWelcomeGuide(true);
        
        // Clean URL after showing guide
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
        <div className="p-2.5 rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Low Stock Alert */}
      {metrics.lowStockProducts > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Alerte Stock
                <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                  {metrics.lowStockProducts}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Produits nécessitant un réapprovisionnement
              </p>
              
              <div className="flex flex-wrap gap-1.5">
                {metrics.lowStockProductsList.map((product) => (
                  <div 
                    key={product.id}
                    className="inline-flex items-center gap-1.5 bg-card rounded-md px-2.5 py-1.5 border border-border text-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    <span className="font-medium text-foreground">{product.name}</span>
                    <span className="text-muted-foreground">
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