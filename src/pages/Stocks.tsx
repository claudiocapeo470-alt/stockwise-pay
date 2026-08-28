import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, AlertTriangle, Edit2, Trash2, Grid3x3, List, History, Bell } from "lucide-react";
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
import { SectionHeading } from "@/components/layout/PageShell";


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
      <div className="space-y-3 animate-fade-in">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-5 animate-fade-in">
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

      {/* Toolbar */}
      <PageActionBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un produit..."
        segments={
          <>
            <Button variant="outline" onClick={() => setShowMovements(true)} className="h-11 gap-1.5 px-3 text-sm rounded-xl"><History className="h-4 w-4 shrink-0" /> Mouvements</Button>
            <ImportProductsDialog />
            {!isMobile && (
              <div className="hidden lg:inline-flex rounded-lg border border-border bg-card p-0.5">
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-9 w-9 p-0"><List className="h-4 w-4" /></Button>
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-9 w-9 p-0"><Grid3x3 className="h-4 w-4" /></Button>
              </div>
            )}
          </>
        }
        primary={<AddProductDialog />}
      />


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
          <SectionHeading
            title="Produits en stock"
            count={filteredProducts.length}
          />
          {/* Grille de cartes produits (remplace l'ancien tableau / liste) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEditProduct(product)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEditProduct(product); } }}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all cursor-pointer hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 pr-16">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">
                        {product.category || (product.sku ? `SKU ${product.sku}` : "Sans catégorie")}
                      </p>
                      <p className="font-bold text-[15px] leading-tight truncate mt-0.5">{product.name}</p>
                      <Badge variant={status.variant} className="text-[10px] mt-2">{status.label}</Badge>
                    </div>

                    <div className="absolute right-2 top-2 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
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
                    </div>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-border/60 pt-3">
                    <p className="text-[11px] text-muted-foreground">Stock {product.quantity}/{product.min_quantity}</p>
                    <p className="text-base font-bold leading-none tabular-nums">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>



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
