import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Package, Search, AlertTriangle, Edit2, Trash2, Grid3x3, List } from "lucide-react";
import { useState } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/stocks/AddProductDialog";
import { EditProductDialog } from "@/components/stocks/EditProductDialog";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { products, isLoading, deleteProduct } = useProducts();
  const isMobile = useIsMobile();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Block with Description and Button */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/40 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Gestion des Stocks</h2>
          <p className="text-blue-700 dark:text-blue-300">Gérez vos produits et surveillez votre inventaire</p>
        </div>
        <AddProductDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Produits</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500 shadow-md">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{products.length}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Stock Critique</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500 shadow-md">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{lowStockProducts.length}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Produits sous le seuil minimum
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Rupture de Stock</CardTitle>
            <div className="p-2 rounded-lg bg-red-500 shadow-md">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{outOfStockProducts.length}</div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Produits épuisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, catégorie ou SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {!isMobile && (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  title="Vue en grille"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  title="Vue en liste"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      <div>
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {products.length === 0 ? "Aucun produit" : "Aucun résultat"}
                </h3>
                <p className="text-muted-foreground">
                  {products.length === 0 
                    ? "Commencez par ajouter votre premier produit"
                    : "Aucun produit trouvé pour cette recherche"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid View - Mobile et Desktop si sélectionné */}
            {(isMobile || viewMode === "grid") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                          {product.sku && (
                            <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                              Code: {product.sku}
                            </p>
                          )}
                        </div>
                        {product.quantity === 0 ? (
                          <Badge variant="destructive" className="shrink-0">Épuisé</Badge>
                        ) : product.quantity <= product.min_quantity ? (
                          <Badge className="bg-warning text-warning-foreground shrink-0">Critique</Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground shrink-0">Disponible</Badge>
                        )}
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="w-fit">{product.category}</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Prix unitaire</p>
                          <p className="font-bold text-lg">{product.price.toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Stock actuel</p>
                          <p className="font-bold text-lg">
                            {product.quantity}
                            <span className="text-xs font-normal text-muted-foreground"> / {product.min_quantity}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="flex-1"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer "{product.name}" ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View - Desktop uniquement */}
            {!isMobile && viewMode === "list" && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold text-sm">Produit</th>
                          <th className="text-left p-4 font-semibold text-sm">Catégorie</th>
                          <th className="text-right p-4 font-semibold text-sm">Prix</th>
                          <th className="text-center p-4 font-semibold text-sm">Stock</th>
                          <th className="text-center p-4 font-semibold text-sm">Statut</th>
                          <th className="text-right p-4 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.sku && (
                                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {product.category ? (
                                <Badge variant="outline">{product.category}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right font-semibold">
                              {product.price.toLocaleString()} FCFA
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium">{product.quantity}</span>
                              <span className="text-muted-foreground text-sm"> / {product.min_quantity}</span>
                            </td>
                            <td className="p-4 text-center">
                              {product.quantity === 0 ? (
                                <Badge variant="destructive">Épuisé</Badge>
                              ) : product.quantity <= product.min_quantity ? (
                                <Badge className="bg-warning text-warning-foreground">Stock critique</Badge>
                              ) : (
                                <Badge className="bg-success text-success-foreground">En stock</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer "{product.name}" ? Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteProduct(product)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {editingProduct && (
        <EditProductDialog 
          product={editingProduct}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingProduct(null);
            }
          }}
        />
      )}
    </div>
  );
}