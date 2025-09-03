import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertTriangle, Package } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  status: "in_stock" | "low_stock" | "out_of_stock"
}

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const getStatusBadge = (status: string, quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-destructive text-destructive-foreground">Épuisé</Badge>
    }
    if (quantity <= 5) {
      return <Badge className="bg-warning text-warning-foreground">Stock faible</Badge>
    }
    return <Badge className="bg-success text-success-foreground">En stock</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA')
  }

  return (
    <Card className="hover:shadow-medium transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted p-2 rounded-lg">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
          </div>
          {getStatusBadge(product.status, product.quantity)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Prix unitaire</span>
            <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantité</span>
            <div className="flex items-center gap-1">
              {product.quantity <= 5 && product.quantity > 0 && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              <span className={`font-medium ${
                product.quantity === 0 ? 'text-destructive' : 
                product.quantity <= 5 ? 'text-warning' : 'text-foreground'
              }`}>
                {product.quantity} unités
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Valeur stock</span>
            <span className="font-semibold text-foreground">
              {formatPrice(product.price * product.quantity)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}