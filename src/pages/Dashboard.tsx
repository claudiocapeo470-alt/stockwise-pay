import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
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
    const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity).length;
    
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary rounded-lg p-2">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
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

      {/* Alerts */}
      {metrics.lowStockProducts > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alerte Stock Critique
            </CardTitle>
            <CardDescription>
              {metrics.lowStockProducts} produit(s) ont un stock critique et nécessitent un réapprovisionnement
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {showWelcomeGuide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WelcomeGuide onClose={handleCloseWelcomeGuide} />
        </div>
      )}

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