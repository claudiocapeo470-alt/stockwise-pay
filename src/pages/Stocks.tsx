import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Search, AlertTriangle, Edit2, Trash2, History, Bell, Layers, Tag } from "lucide-react";
import { useState } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/stocks/AddProductDialog";
import { EditProductDialog } from "@/components/stocks/EditProductDialog";
import { ImportProductsDialog } from "@/components/stocks/ImportProductsDialog";
import { StockMovementsDialog } from "@/components/stocks/StockMovementsDialog";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageActionBar } from "@/components/layout/PageActionBar";
import { SectionHeading, StickyTop } from "@/components/layout/PageShell";
import { ProductGrid, ProductGridCard, ProductMeta } from "@/components/products/ProductGridCard";


export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
      <div className="space-y-3 animate-fade-in">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-3 animate-fade-in">
      <StickyTop>
        {/* 1. Recherche + ajout */}
        <PageActionBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher un produit..."
          primary={<AddProductDialog />}
        />


        {/* Stats */}
        <div className="stat-scroller" style={{ ["--stat-cols" as any]: 3 }}>
          <Card className="border-border/60">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-none">{products.length}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Total Produits</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-border/60 ${lowStockProducts.length > 0 ? "border-warning/40 bg-warning/5" : ""}`}>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-warning/10 flex items-center justify-center rounded-xl shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-none">{lowStockProducts.length}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Stock Critique</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-border/60 ${outOfStockProducts.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}`}>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-destructive/10 flex items-center justify-center rounded-xl shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-none">{outOfStockProducts.length}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">Rupture</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Actions secondaires sous les blocs KPI */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-2.5 py-1">
            <Button
              variant="outline"
              onClick={() => setShowMovements(true)}
              className="h-11 shrink-0 rounded-full border-foreground/70 px-5 text-sm font-semibold"
            >
              <History className="h-4 w-4 shrink-0" /> Mouvements
            </Button>

            <ImportProductsDialog />
          </div>
        </div>


      </StickyTop>


      <SectionHeading title="Produits en stock" count={filteredProducts.length} />


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
          {/* Grille catalogue : 2 colonnes mobile, 3 tablette, 4 desktop */}
          <ProductGrid>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <ProductGridCard
                  key={product.id}
                  image={product.image_url}
                  name={product.name}
                  onClick={() => handleEditProduct(product)}
                  badge={
                    <Badge variant={status.variant} className="text-[8px] px-1 py-0">{status.label}</Badge>
                  }
                  meta={
                    <>
                      <ProductMeta icon={<Layers className="h-2.5 w-2.5" />}>
                        {product.quantity}/{product.min_quantity}
                      </ProductMeta>
                      <ProductMeta icon={<Tag className="h-2.5 w-2.5" />} className="max-w-[55%]">
                        {product.category || (product.sku ? `SKU ${product.sku}` : "Sans catégorie")}
                      </ProductMeta>
                    </>
                  }
                  price={formatCurrency(product.price)}
                  actions={
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                        className="h-6 w-6 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Modifier"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>

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
                    </>
                  }
                />
              );
            })}
          </ProductGrid>



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
