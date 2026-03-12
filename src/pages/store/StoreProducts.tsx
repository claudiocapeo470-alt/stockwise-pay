import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/useProducts";
import { useOnlineStore, useStoreProducts } from "@/hooks/useOnlineStore";
import { useQueryClient } from "@tanstack/react-query";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import { toast } from "sonner";
import { Star, Trash2, Edit2 } from "lucide-react";
import { StoreProductEditDialog } from "@/components/store/StoreProductEditDialog";

export default function StoreProducts() {
  const { store } = useOnlineStore();
  const { products } = useProducts();
  const { storeProducts, publishProducts, removeProduct } = useStoreProducts(store?.id);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number>>({});
  const [editingProduct, setEditingProduct] = useState<{ storeProduct: any; product: any } | null>(null);

  const publishedProductIds = new Set(storeProducts.map((sp: any) => sp.product_id));
  const unpublished = products.filter(p => !publishedProductIds.has(p.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handlePublishSelected = async () => {
    if (selected.size === 0) return;
    try {
      const items = Array.from(selected).map(pid => ({
        product_id: pid,
        online_price: onlinePrices[pid] || products.find(p => p.id === pid)?.price || 0,
      }));
      await publishProducts.mutateAsync(items);
      toast.success(`${selected.size} produit(s) publié(s) !`);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeProduct.mutateAsync(productId);
      toast.success("Produit retiré de la boutique");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = (sp: any) => {
    const product = sp.products;
    if (!product) return;
    setEditingProduct({ storeProduct: sp, product });
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['store-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  if (!store) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Veuillez d'abord configurer votre boutique dans "Ma Boutique"</p>
    </div>
  );

  const ProductIcon = ({ product }: { product: any }) => (
    product.image_url ? (
      <img src={product.image_url} alt={product.name} className="h-8 w-8 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={getIconBgStyle(product.icon_bg_color || 'bg-blue')}>
        <span className="text-lg">{product.icon_emoji || '📦'}</span>
      </div>
    )
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">📦 Produits en ligne</h1>

      <Tabs defaultValue="online">
        <TabsList>
          <TabsTrigger value="online">En ligne ({storeProducts.length})</TabsTrigger>
          <TabsTrigger value="unpublished">À publier ({unpublished.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-4">
          {/* Desktop table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Prix boutique</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Vedette</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeProducts.map((sp: any) => {
                  const product = sp.products;
                  if (!product) return null;
                  return (
                    <TableRow key={sp.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProductIcon product={product} />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{(sp.online_price || product.price).toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        {product.quantity === 0 ? <Badge variant="destructive">Rupture</Badge> : <span>{product.quantity}</span>}
                      </TableCell>
                      <TableCell>{sp.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(sp)} title="Modifier">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleRemove(sp.product_id)} title="Retirer">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {storeProducts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun produit publié</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {storeProducts.map((sp: any) => {
              const product = sp.products;
              if (!product) return null;
              return (
                <Card key={sp.id} className="cursor-pointer" onClick={() => handleEdit(sp)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProductIcon product={product} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm font-bold text-primary">{(sp.online_price || product.price).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sp.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        {product.quantity === 0 ? <Badge variant="destructive">Rupture</Badge> : <span className="text-xs text-muted-foreground">Stock: {product.quantity}</span>}
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemove(sp.product_id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {storeProducts.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Aucun produit publié</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unpublished" className="mt-4 space-y-4">
          {selected.size > 0 && (
            <Button onClick={handlePublishSelected} disabled={publishProducts.isPending} className="gap-2">
              ✅ Publier la sélection ({selected.size} produits)
            </Button>
          )}

          {/* Desktop table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix actuel</TableHead>
                  <TableHead>Prix boutique</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpublished.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProductIcon product={product} />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || '—'}</TableCell>
                    <TableCell>{product.price.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Input
                        type="number" min="0" className="w-28 h-8 text-sm"
                        defaultValue={product.price}
                        onChange={e => setOnlinePrices(p => ({ ...p, [product.id]: Number(e.target.value) }))}
                      />
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                  </TableRow>
                ))}
                {unpublished.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tous les produits sont déjà publiés</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {unpublished.map(product => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                    <ProductIcon product={product} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category || 'Sans catégorie'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold">{product.price.toLocaleString()} FCFA</span>
                        <span className="text-xs text-muted-foreground">Stock: {product.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Input
                      type="number" min="0" className="h-8 text-sm"
                      placeholder="Prix boutique"
                      defaultValue={product.price}
                      onChange={e => setOnlinePrices(p => ({ ...p, [product.id]: Number(e.target.value) }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {unpublished.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Tous les produits sont déjà publiés</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingProduct && store && (
        <StoreProductEditDialog
          storeProduct={editingProduct.storeProduct}
          product={editingProduct.product}
          storeId={store.id}
          open={!!editingProduct}
          onOpenChange={(open) => { if (!open) setEditingProduct(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
