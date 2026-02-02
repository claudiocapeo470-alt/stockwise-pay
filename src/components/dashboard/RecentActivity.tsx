import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Receipt, AlertTriangle, Activity, Clock, CreditCard, TrendingUp } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useSales } from "@/hooks/useSales"
import { usePayments } from "@/hooks/usePayments"
import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const getIconConfig = (type: string) => {
  switch (type) {
    case "sale":
      return {
        icon: ShoppingCart,
        bg: "bg-gradient-to-br from-primary to-accent",
        color: "text-white"
      }
    case "stock":
      return {
        icon: Package,
        bg: "bg-gradient-to-br from-warning to-orange-600",
        color: "text-white"
      }
    case "payment":
      return {
        icon: CreditCard,
        bg: "bg-gradient-to-br from-success to-emerald-600",
        color: "text-white"
      }
    default:
      return {
        icon: AlertTriangle,
        bg: "bg-muted",
        color: "text-muted-foreground"
      }
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-success/10 text-success border-success/30 text-xs font-medium">Terminé</Badge>
    case "warning":
      return <Badge className="bg-warning/10 text-warning border-warning/30 text-xs font-medium">Attention</Badge>
    case "pending":
      return <Badge className="bg-muted text-muted-foreground text-xs font-medium">En attente</Badge>
    default:
      return null
  }
}

export function RecentActivity() {
  const { products = [] } = useProducts()
  const { sales = [] } = useSales() 
  const { payments = [] } = usePayments()

  const activities = useMemo(() => {
    const allActivities = []

    // Add recent sales
    const recentSales = sales.slice(0, 3).map(sale => {
      const product = products.find(p => p.id === sale.product_id)
      return {
        id: `sale-${sale.id}`,
        type: "sale",
        title: "Vente produit",
        description: `${product?.name || 'Produit'} - ${sale.customer_name ? `Client: ${sale.customer_name}` : 'Vente directe'}`,
        amount: `${sale.total_amount.toLocaleString()} CFA`,
        time: formatDistanceToNow(new Date(sale.created_at), { addSuffix: true, locale: fr }),
        status: "completed"
      }
    })

    // Add low stock alerts
    const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity).slice(0, 2).map(product => ({
      id: `stock-${product.id}`,
      type: "stock",
      title: "Stock faible",
      description: `${product.name} - Reste ${product.quantity} unité${product.quantity > 1 ? 's' : ''}`,
      time: "Maintenant",
      status: "warning"
    }))

    // Add recent payments
    const recentPayments = payments.slice(0, 2).map(payment => ({
      id: `payment-${payment.id}`,
      type: "payment",
      title: "Paiement reçu",
      description: `${payment.payment_method}${payment.customer_first_name || payment.customer_last_name ? ` - ${payment.customer_first_name} ${payment.customer_last_name}` : ''}`,
      amount: `${payment.total_amount.toLocaleString()} CFA`,
      time: formatDistanceToNow(new Date(payment.created_at), { addSuffix: true, locale: fr }),
      status: payment.status === 'completed' ? 'completed' : 'pending'
    }))

    allActivities.push(...recentSales, ...lowStockProducts, ...recentPayments)
    
    // Sort by most recent and limit to 6
    return allActivities
      .sort((a, b) => new Date(b.time === 'Maintenant' ? Date.now() : a.time).getTime() - new Date(a.time === 'Maintenant' ? Date.now() : b.time).getTime())
      .slice(0, 6)
  }, [products, sales, payments])

  return (
    <Card className="relative overflow-hidden border-2 border-border/60 bg-card">
      {/* Bordure lumineuse */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />
      
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          Activité récente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {activities.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">Aucune activité récente</p>
            <p className="text-sm text-muted-foreground">
              Vos dernières actions apparaîtront ici
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const iconConfig = getIconConfig(activity.type)
            const Icon = iconConfig.icon
            return (
              <div 
                key={activity.id} 
                className={`
                  flex items-center gap-4 p-3 rounded-xl
                  hover:bg-muted/50 transition-all duration-200
                  ${index !== activities.length - 1 ? 'border-b border-border/40' : ''}
                `}
              >
                <div className={`
                  p-2.5 rounded-xl ${iconConfig.bg} 
                  shadow-md shrink-0
                `}>
                  <Icon className={`h-4 w-4 ${iconConfig.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
