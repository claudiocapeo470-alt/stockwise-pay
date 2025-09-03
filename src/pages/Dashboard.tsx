import { MetricCard } from "@/components/dashboard/MetricCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ventes du jour"
          value="2 450 000 CFA"
          change="+12% vs hier"
          changeType="positive"
          icon={ShoppingCart}
          gradient="primary"
        />
        
        <MetricCard
          title="Produits en stock"
          value="156"
          change="8 en rupture"
          changeType="negative"
          icon={Package}
          gradient="success"
        />
        
        <MetricCard
          title="Paiements en attente"
          value="850 000 CFA"
          change="5 factures"
          changeType="neutral"
          icon={Receipt}
          gradient="warning"
        />
        
        <MetricCard
          title="Bénéfice mensuel"
          value="12 500 000 CFA"
          change="+8% vs mois dernier"
          changeType="positive"
          icon={TrendingUp}
          gradient="primary"
        />
      </div>

      {/* Alerts Section */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Alertes importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-warning/20">
            <div>
              <p className="font-medium text-foreground">Stock critique</p>
              <p className="text-sm text-muted-foreground">8 produits ont un stock inférieur à 5 unités</p>
            </div>
            <Badge className="bg-warning text-warning-foreground">Urgent</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-warning/20">
            <div>
              <p className="font-medium text-foreground">Paiements en retard</p>
              <p className="text-sm text-muted-foreground">3 clients ont des paiements en retard depuis plus de 7 jours</p>
            </div>
            <Badge variant="outline">À suivre</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}