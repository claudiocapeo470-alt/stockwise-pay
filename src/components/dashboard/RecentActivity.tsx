import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Receipt, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "sale",
    title: "Vente produit",
    description: "iPhone 13 - Client: Marie Dupont",
    amount: "850 000 CFA",
    time: "Il y a 2h",
    status: "completed"
  },
  {
    id: 2,
    type: "stock",
    title: "Stock faible",
    description: "Samsung Galaxy A54 - Reste 2 unités",
    time: "Il y a 3h",
    status: "warning"
  },
  {
    id: 3,
    type: "payment",
    title: "Paiement reçu",
    description: "Mobile Money - Orange Money",
    amount: "250 000 CFA",
    time: "Il y a 5h",
    status: "completed"
  },
  {
    id: 4,
    type: "sale",
    title: "Nouvelle vente",
    description: "MacBook Air - Client: Paul Martin",
    amount: "1 200 000 CFA",
    time: "Hier",
    status: "pending"
  }
]

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
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
        })}
      </CardContent>
    </Card>
  )
}