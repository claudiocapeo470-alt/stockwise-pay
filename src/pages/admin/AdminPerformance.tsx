import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  growthRate: number;
}

export default function AdminPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      // Récupérer les métriques de performance
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscriptions } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount');

      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const totalSales = salesData?.length || 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculer le taux de croissance (simulé pour le moment)
      const growthRate = 12.5;

      setMetrics({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue,
        totalSales,
        averageOrderValue,
        growthRate,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      toast.error('Erreur lors du chargement des métriques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format: 'pdf' | 'csv') => {
    toast.info(`Export ${format.toUpperCase()}`, {
      description: "La fonctionnalité d'export nécessite une implémentation supplémentaire"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Performance & Rapports</h1>
          <p className="text-muted-foreground mt-2">Analyses avancées de votre SaaS</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance & Rapports</h1>
          <p className="text-muted-foreground mt-2">
            Analyses détaillées et métriques de votre plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{metrics?.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ce mois vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.activeSubscriptions} abonnés actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(metrics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Toutes les ventes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(metrics?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalUsers ? ((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visiteurs → Abonnés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports Détaillés</CardTitle>
          <CardDescription>
            Analyses approfondies et visualisations de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Rapport des Ventes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyse détaillée des ventes par période, produit et utilisateur
              </p>
              <Button variant="outline" className="w-full">
                Générer le rapport
              </Button>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Rapport des Abonnements</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suivi des abonnements, renouvellements et churns
              </p>
              <Button variant="outline" className="w-full">
                Générer le rapport
              </Button>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Rapport d'Inventaire</h3>
              <p className="text-sm text-muted-foreground mb-4">
                État des stocks, mouvements et valorisation
              </p>
              <Button variant="outline" className="w-full">
                Générer le rapport
              </Button>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Rapport Financier</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revenus, dépenses et projections financières
              </p>
              <Button variant="outline" className="w-full">
                Générer le rapport
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
