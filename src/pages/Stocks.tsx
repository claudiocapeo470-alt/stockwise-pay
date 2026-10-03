import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, AlertTriangle, Edit2, Trash2, History, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/stocks/AddProductDialog";
import { EditProductDialog } from "@/components/stocks/EditProductDialog";
import { ImportProductsDialog } from "@/components/stocks/ImportProductsDialog";
import { StockMovementsDialog } from "@/components/stocks/StockMovementsDialog";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { PageActionBar } from "@/components/layout/PageActionBar";
import { SectionHeading, StickyTop } from "@/components/layout/PageShell";
import { ListAvatar, ListBadge, ListEmpty, ListRow, ListShell } from "@/components/layout/MinimalList";


export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  const { products, isLoading, deleteProduct } = useProducts();
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
        <ListEmpty
          icon={<Package className="h-5 w-5" />}
          title={products.length === 0 ? "Aucun produit" : "Aucun résultat"}
          description={products.length === 0 ? "Commencez par ajouter votre premier produit" : "Aucun produit trouvé pour cette recherche"}
        />
      ) : (
          <ListShell>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <ListRow
                  key={product.id}
                  onClick={() => handleEditProduct(product)}
                  onSwipeDelete={() => handleDeleteProduct(product)}
                  leading={
                    <ListAvatar
                      src={product.image_url}
                      alt={product.name}
                      icon={<Package className="h-5 w-5" />}
                      tone={status.variant === "destructive" ? "destructive" : status.variant === "warning" ? "warning" : "primary"}
                    />
                  }
                  title={product.name}
                  badge={
                    <ListBadge className={status.variant === "destructive" ? "bg-destructive/10 text-destructive" : status.variant === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}>
                      {status.label}
                    </ListBadge>
                  }
                  subtitle={product.category || "Sans catégorie"}
                  meta={product.sku ? `SKU ${product.sku}` : `Seuil d’alerte : ${product.min_quantity}`}
                  value={formatCurrency(product.price)}
                  hint={`${product.quantity} en stock`}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label={`Actions pour ${product.name}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}><Edit2 className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              );
            })}
          </ListShell>
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
