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
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-secondary bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
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
        <Card className="bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-600 shadow-xl shadow-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-red-600 shadow-lg shadow-red-500/50 shrink-0">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  Alerte Stock Critique
                  <span className="text-base font-normal bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                    {metrics.lowStockProducts}
                  </span>
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {metrics.lowStockProductsList.map((product) => (
                    <div 
                      key={product.id}
                      className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-300 dark:border-red-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="font-semibold text-foreground">{product.name}</span>
                      <span className="text-xs text-muted-foreground bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                        {product.quantity}/{product.min_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
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