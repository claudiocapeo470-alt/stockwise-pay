import { useState } from "react"
import { ProductCard } from "@/components/stocks/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Package, AlertTriangle, TrendingDown } from "lucide-react"

// Mock data
const mockProducts = [
  {
    id: 1,
    name: "iPhone 13 Pro",
    price: 850000,
    quantity: 12,
    category: "Smartphones",
    status: "in_stock" as const
  },
  {
    id: 2,
    name: "Samsung Galaxy A54",
    price: 285000,
    quantity: 3,
    category: "Smartphones", 
    status: "low_stock" as const
  },
  {
    id: 3,
    name: "MacBook Air M2",
    price: 1200000,
    quantity: 0,
    category: "Ordinateurs",
    status: "out_of_stock" as const
  },
  {
    id: 4,
    name: "iPad Air",
    price: 650000,
    quantity: 8,
    category: "Tablettes",
    status: "in_stock" as const
  },
  {
    id: 5,
    name: "AirPods Pro",
    price: 185000,
    quantity: 2,
    category: "Accessoires",
    status: "low_stock" as const
  },
  {
    id: 6,
    name: "Dell XPS 13",
    price: 950000,
    quantity: 15,
    category: "Ordinateurs",
    status: "in_stock" as const
  }
]

export default function Stocks() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stockStats = {
    total: products.length,
    inStock: products.filter(p => p.quantity > 5).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= 5).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  }

  const handleEdit = (product: any) => {
    console.log("Edit product:", product)
    // TODO: Open edit modal
  }

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des stocks</h1>
          <p className="text-muted-foreground">
            Gérez vos produits et surveillez les niveaux de stock
          </p>
        </div>
        
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold text-foreground">{stockStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-warning">{stockStats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Épuisé</p>
                <p className="text-2xl font-bold text-destructive">{stockStats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(stockStats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Tous ({stockStats.total})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                En stock ({stockStats.inStock})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-warning border-warning">
                Stock faible ({stockStats.lowStock})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-destructive border-destructive">
                Épuisé ({stockStats.outOfStock})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou ajoutez votre premier produit.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}