import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, ShoppingCart, Calendar, Filter, TrendingUp } from "lucide-react"

// Mock data
const mockSales = [
  {
    id: 1,
    productName: "iPhone 13 Pro",
    customer: "Marie Dupont",
    quantity: 1,
    unitPrice: 850000,
    total: 850000,
    date: "2024-01-15",
    status: "completed",
    paymentMethod: "Mobile Money"
  },
  {
    id: 2,
    productName: "Samsung Galaxy A54", 
    customer: "Paul Martin",
    quantity: 2,
    unitPrice: 285000,
    total: 570000,
    date: "2024-01-15",
    status: "pending",
    paymentMethod: "Cash"
  },
  {
    id: 3,
    productName: "MacBook Air M2",
    customer: "Sophie Durand",
    quantity: 1,
    unitPrice: 1200000,
    total: 1200000,
    date: "2024-01-14",
    status: "completed",
    paymentMethod: "Orange Money"
  },
  {
    id: 4,
    productName: "AirPods Pro",
    customer: "Jean Kamara",
    quantity: 3,
    unitPrice: 185000,
    total: 555000,
    date: "2024-01-14", 
    status: "completed",
    paymentMethod: "Wave"
  },
  {
    id: 5,
    productName: "iPad Air",
    customer: "Fatou Ba",
    quantity: 1,
    unitPrice: 650000,
    total: 650000,
    date: "2024-01-13",
    status: "cancelled",
    paymentMethod: "Cash"
  }
]

export default function Ventes() {
  const [sales, setSales] = useState(mockSales)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const salesStats = {
    totalSales: sales.length,
    completedSales: sales.filter(s => s.status === "completed").length,
    pendingSales: sales.filter(s => s.status === "pending").length,
    totalRevenue: sales.filter(s => s.status === "completed").reduce((sum, s) => sum + s.total, 0),
    todayRevenue: sales.filter(s => s.date === "2024-01-15" && s.status === "completed").reduce((sum, s) => sum + s.total, 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Terminée</Badge>
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>
      case "cancelled":
        return <Badge variant="outline" className="text-destructive border-destructive">Annulée</Badge>
      default:
        return <Badge variant="outline">Inconnue</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des ventes</h1>
          <p className="text-muted-foreground">
            Suivez et gérez toutes vos ventes
          </p>
        </div>
        
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle vente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ventes totales</p>
                <p className="text-2xl font-bold text-foreground">{salesStats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(salesStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(salesStats.todayRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-warning">{salesStats.pendingSales}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par produit ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Toutes
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Terminées
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                En attente
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Aujourd'hui
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{sale.productName}</h4>
                      {getStatusBadge(sale.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Client: {sale.customer} • {sale.quantity} unité(s) • {sale.paymentMethod}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(sale.date)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatPrice(sale.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(sale.unitPrice)} / unité
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucune vente trouvée
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou enregistrez votre première vente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}