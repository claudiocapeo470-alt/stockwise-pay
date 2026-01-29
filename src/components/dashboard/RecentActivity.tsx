import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Receipt, AlertTriangle, Activity } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useSales } from "@/hooks/useSales"
import { usePayments } from "@/hooks/usePayments"
import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const getIcon = (type: string) => {
  switch (type) {
    case "sale":
      return ShoppingCart
    case "stock":
      return Package
    case "payment":
      return Receipt
    default:
      return AlertTriangle
  }
}

const getIconClasses = (type: string) => {
  switch (type) {
    case "sale":
      return "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
    case "stock":
      return "bg-gradient-to-br from-warning to-orange-500 text-warning-foreground"
    case "payment":
      return "bg-gradient-to-br from-secondary to-accent text-secondary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">Terminé</Badge>
    case "warning":
      return <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">Attention</Badge>
    case "pending":
      return <Badge variant="outline" className="border-muted-foreground/30">En attente</Badge>
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
    
    // Sort by most recent and limit to 4
    return allActivities
      .sort((a, b) => new Date(b.time === 'Maintenant' ? Date.now() : a.time).getTime() - new Date(a.time === 'Maintenant' ? Date.now() : b.time).getTime())
      .slice(0, 4)
  }, [products, sales, payments])

  return (
    <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border border-secondary/20 hover:border-secondary/40 transition-all duration-500 hover:shadow-blue-glow">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-secondary opacity-80">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      
      {/* Mesh background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
      
      <CardHeader className="pt-6 relative z-10">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-accent shadow-blue-glow">
            <Activity className="h-4 w-4 text-secondary-foreground" />
          </div>
          <span className="text-foreground">Activité récente</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        {activities.length === 0 ? (
          <div className="text-center py-10 px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Aucune activité récente
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Commencez par ajouter des produits et effectuer des ventes
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type)
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2.5 rounded-xl ${getIconClasses(activity.type)} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className="text-sm font-bold text-primary">
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
      
      {/* Decorative glow */}
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-br from-secondary to-accent opacity-10 blur-3xl" />
    </Card>
  )
}
