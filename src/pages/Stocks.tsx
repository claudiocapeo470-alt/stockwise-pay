import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, AlertTriangle, Edit2, Trash2, Grid3x3, List, History } from "lucide-react";
import { useState } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/stocks/AddProductDialog";
import { EditProductDialog } from "@/components/stocks/EditProductDialog";
import { ImportProductsDialog } from "@/components/stocks/ImportProductsDialog";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import { StockMovementsDialog } from "@/components/stocks/StockMovementsDialog";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showMovements, setShowMovements] = useState(false);
  const { products, isLoading, deleteProduct } = useProducts();
  const isMobile = useIsMobile();
  const { formatCurrency } = useCurrency();

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

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return { label: 'Épuisé', variant: 'destructive' as const };
    if (product.quantity <= product.min_quantity) return { label: 'Critique', variant: 'warning' as const };
    return { label: 'En stock', variant: 'success' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-muted-foreground">Total Produits</p>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              <p className="text-sm text-muted-foreground">Stock Critique</p>
            </div>
          </CardContent>
        </Card>
        <Card className={outOfStockProducts.length > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-destructive/10 flex items-center justify-center rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              <p className="text-sm text-muted-foreground">Rupture de Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Rechercher par nom, catégorie ou SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {!isMobile && (
            <>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid3x3 className="h-4 w-4" /></Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowMovements(true)} className="gap-1"><History className="h-4 w-4" /> Mouvements</Button>
          <ImportProductsDialog />
          <AddProductDialog />
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{products.length === 0 ? "Aucun produit" : "Aucun résultat"}</h3>
            <p className="text-muted-foreground mb-4">{products.length === 0 ? "Commencez par ajouter votre premier produit" : "Aucun produit trouvé pour cette recherche"}</p>
            {products.length === 0 && <AddProductDialog />}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Table view */}
          {!isMobile && viewMode === "list" && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={getIconBgStyle(product.icon_bg_color || 'bg-blue')}>
                              <span className="text-xl">{product.icon_emoji || '📦'}</span>
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category ? <Badge variant="outline">{product.category}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-center"><span className="font-medium">{product.quantity}</span><span className="text-muted-foreground text-sm"> / {product.min_quantity}</span></TableCell>
                        <TableCell className="text-center"><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}><Edit2 className="h-4 w-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{product.name}" ?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProduct(product)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Grid view */}
          {(isMobile || viewMode === "grid") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product);
                return (
                  <Card key={product.id} className="hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={getIconBgStyle(product.icon_bg_color || 'bg-blue')}>
                            <span className="text-2xl">{product.icon_emoji || '📦'}</span>
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{product.name}</CardTitle>
                            {product.sku && <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>}
                          </div>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {product.category && <Badge variant="outline">{product.category}</Badge>}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Prix unitaire</p>
                          <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p className="text-lg font-bold">{product.quantity}<span className="text-xs font-normal text-muted-foreground"> / {product.min_quantity}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} className="flex-1"><Edit2 className="h-3.5 w-3.5 mr-1.5" />Modifier</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="flex-1"><Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{product.name}" ?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={showEditDialog}
          onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingProduct(null); }}
        />
      )}

      <StockMovementsDialog open={showMovements} onOpenChange={setShowMovements} />
    </div>
  );
}
