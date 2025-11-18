import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalProducts: number;
  lowStockProducts: number;
  revenueThisMonth: number;
  newUsersThisWeek: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Récupérer le nombre total d'utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Récupérer les abonnements actifs
      const { count: activeSubscriptions } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Récupérer le nombre total de produits
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Récupérer les produits en stock faible
      const { data: lowStockData } = await supabase
        .from('products')
        .select('quantity, min_quantity');

      const lowStockProducts = lowStockData?.filter(
        (product) => product.quantity <= product.min_quantity
      ).length || 0;

      // Récupérer les ventes du mois en cours
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', startOfMonth.toISOString());

      const revenueThisMonth = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      // Récupérer les nouveaux utilisateurs cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalProducts: totalProducts || 0,
        lowStockProducts,
        revenueThisMonth,
        newUsersThisWeek: newUsersThisWeek || 0,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de votre plateforme SaaS</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de votre plateforme SaaS Stocknix</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.newUsersThisWeek} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Abonnements en cours
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats?.revenueThisMonth || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ventes ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dans l'inventaire global
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produits nécessitant attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilisateurs abonnés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a href="/admin/users" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Gérer les Utilisateurs</h3>
            <p className="text-sm text-muted-foreground">Voir et modifier les comptes</p>
          </a>
          <a href="/admin/subscriptions" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <CreditCard className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Gérer les Abonnements</h3>
            <p className="text-sm text-muted-foreground">Suivre les paiements</p>
          </a>
          <a href="/admin/notifications" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Envoyer une Annonce</h3>
            <p className="text-sm text-muted-foreground">Notifier les utilisateurs</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
