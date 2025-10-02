import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Receipt, AlertTriangle } from "lucide-react"
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-success text-success-foreground">Terminé</Badge>
    case "warning":
      return <Badge className="bg-warning text-warning-foreground">Attention</Badge>
    case "pending":
      return <Badge variant="outline">En attente</Badge>
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
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune activité récente
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Commencez par ajouter des produits et effectuer des ventes
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="bg-muted p-2 rounded-lg">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className="text-sm font-medium text-foreground">
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