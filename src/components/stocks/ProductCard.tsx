import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { EditProductDialog } from "./EditProductDialog";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  min_quantity: number;
  category?: string;
  sku?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { deleteProduct } = useProducts();

  const getStatusBadge = () => {
    if (product.quantity === 0) {
      return <Badge variant="destructive">Épuisé</Badge>;
    }
    if (product.quantity <= product.min_quantity) {
      return <Badge className="bg-warning text-warning-foreground">Stock bas</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">En stock</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price).replace('XOF', 'CFA');
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct.mutateAsync(product.id);
        toast.success('Produit supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <>
      <Card className="hover:shadow-medium transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold truncate">
                {product.name}
              </CardTitle>
              {product.category && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.category}
                </p>
              )}
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Prix unitaire</p>
              <p className="font-semibold text-lg text-primary">
                {formatPrice(product.price)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantité</p>
              <p className="font-semibold text-lg">
                {product.quantity}
                <span className="text-sm text-muted-foreground ml-1">
                  / {product.min_quantity} min
                </span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valeur stock</span>
              <span className="font-medium">
                {formatPrice(product.price * product.quantity)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditProductDialog 
        product={product}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}