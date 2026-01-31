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
      return "bg-primary/10 text-primary"
    case "stock":
      return "bg-warning/10 text-warning"
    case "payment":
      return "bg-secondary/10 text-secondary"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="outline" className="text-success border-success/30 text-xs">Terminé</Badge>
    case "warning":
      return <Badge variant="outline" className="text-warning border-warning/30 text-xs">Attention</Badge>
    case "pending":
      return <Badge variant="outline" className="text-muted-foreground text-xs">En attente</Badge>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-secondary" />
          Activité récente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune activité récente
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getIconClasses(activity.type)} shrink-0`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className="text-xs font-semibold text-primary">
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
