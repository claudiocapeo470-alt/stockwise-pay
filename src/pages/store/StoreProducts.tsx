import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts } from '@/hooks/useProducts';
import { useOnlineStore, useStoreProducts } from '@/hooks/useOnlineStore';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Globe, Package, Search } from 'lucide-react';
import { StoreProductEditDialog } from '@/components/store/StoreProductEditDialog';

function ProductIcon({ product }: { product: any }) {
  if (product.image_url) return <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />;
  return (
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
      {product.icon_emoji || '📦'}
    </div>
  );
}

function CreateProductDialog({ open, onClose, storeId, onCreated }: { open: boolean; onClose: () => void; storeId: string; onCreated: () => void }) {
  const { addProduct } = useProducts();
  const { publishProducts } = useStoreProducts(storeId);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Le nom du produit est requis'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { toast.error('Entrez un prix valide'); return; }
    setSaving(true);
    try {
      const newProduct = await addProduct.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        quantity: 0,
        min_quantity: 0,
        category: form.category.trim() || null,
        sku: null,
        icon_emoji: '🛍️',
        icon_bg_color: null,
        image_url: form.imageUrl.trim() || null,
      });
      await publishProducts.mutateAsync([{ product_id: newProduct.id, online_price: Number(form.price) }]);
      toast.success('✅ Produit créé et publié !');
      onCreated();
      onClose();
      setForm({ name: '', description: '', price: '', category: '', imageUrl: '' });
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Nouveau produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom du produit *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: T-shirt Wax" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prix (XOF) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="5000" />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Vêtements..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Décrivez votre produit..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>URL image (optionnel)</Label>
            <Input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Annuler</Button>
          <Button onClick={handleCreate} disabled={saving} className="w-full sm:w-auto">{saving ? 'Création...' : 'Créer et publier'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mobile card for online products
function OnlineProductCard({ sp, onEdit, onRemove }: { sp: any; onEdit: () => void; onRemove: () => void }) {
  const product = sp.products;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {product && <ProductIcon product={product} />}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{product?.name || '—'}</p>
            <p className="text-xs text-muted-foreground truncate">{product?.category || 'Sans catégorie'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold">{sp.online_price?.toLocaleString()} XOF</span>
              <Badge variant="secondary" className="text-[10px]">{sp.is_active !== false ? 'Actif' : 'Inactif'}</Badge>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile card for stock products
function StockProductCard({ product, selected, onToggle, onlinePrice, onPriceChange, onPublish }: {
  product: any; selected: boolean; onToggle: () => void; onlinePrice: number; onPriceChange: (v: number) => void; onPublish: () => void;
}) {
  return (
    <Card className={`overflow-hidden ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={selected} onCheckedChange={onToggle} className="mt-1" />
          <ProductIcon product={product} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.category || 'Sans catégorie'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stock: {product.price?.toLocaleString()} XOF</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
          <Input type="number" className="h-8 text-sm flex-1" value={onlinePrice} onChange={e => onPriceChange(Number(e.target.value))} placeholder="Prix en ligne" />
          <Button size="sm" variant="outline" className="gap-1 flex-shrink-0 text-xs" onClick={onPublish}>
            <Globe className="h-3 w-3" /> Publier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoreProducts() {
  const { store } = useOnlineStore();
  const { products } = useProducts();
  const { storeProducts, publishProducts, removeProduct } = useStoreProducts(store?.id);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number>>({});
  const [editingProduct, setEditingProduct] = useState<{ storeProduct: any; product: any } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState('');

  const publishedIds = new Set(storeProducts.map((sp: any) => sp.product_id));
  const unpublished = products.filter(p => !publishedIds.has(p.id));
  const filteredUnpublished = unpublished.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredOnline = storeProducts.filter((sp: any) => !search || sp.products?.name?.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handlePublishSelected = async () => {
    if (selected.size === 0) return;
    try {
      await publishProducts.mutateAsync(Array.from(selected).map(pid => ({ product_id: pid, online_price: onlinePrices[pid] || products.find(p => p.id === pid)?.price || 0 })));
      toast.success(`${selected.size} produit(s) publié(s) !`);
      setSelected(new Set());
    } catch (e: any) { toast.error(e.message); }
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['store-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  if (!store) return (
    <div className="text-center py-16 space-y-3">
      <Globe className="h-12 w-12 mx-auto text-muted-foreground/30" />
      <p className="text-muted-foreground font-medium">Configurez d'abord votre boutique dans "Ma Boutique"</p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Produits en ligne</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{storeProducts.length} en ligne · {unpublished.length} non publiés</p>
        </div>
        <Button size={isMobile ? "sm" : "default"} onClick={() => setShowCreateDialog(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Créer un produit
        </Button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9 h-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="online">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="online" className="flex-1 sm:flex-none text-xs sm:text-sm">
            En ligne <Badge variant="secondary" className="ml-1 text-[10px]">{storeProducts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Stock <Badge variant="secondary" className="ml-1 text-[10px]">{unpublished.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-3">
          {filteredOnline.length === 0 ? (
            <Card><CardContent className="py-10 sm:py-14 text-center space-y-3">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">Aucun produit en ligne</p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" /> Créer votre premier produit
              </Button>
            </CardContent></Card>
          ) : isMobile ? (
            <div className="space-y-2">
              {filteredOnline.map((sp: any) => (
                <OnlineProductCard
                  key={sp.id}
                  sp={sp}
                  onEdit={() => sp.products && setEditingProduct({ storeProduct: sp, product: sp.products })}
                  onRemove={async () => { try { await removeProduct.mutateAsync(sp.product_id); toast.success('Retiré'); } catch (e: any) { toast.error(e.message); } }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Prix en ligne</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredOnline.map((sp: any) => {
                      const product = sp.products;
                      return (
                        <TableRow key={sp.id}>
                          <TableCell><div className="flex items-center gap-3">{product && <ProductIcon product={product} />}<span className="font-medium text-sm">{product?.name || '—'}</span></div></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{product?.category || '—'}</TableCell>
                          <TableCell className="font-semibold">{sp.online_price?.toLocaleString()} XOF</TableCell>
                          <TableCell><Badge variant={sp.is_active !== false ? 'default' : 'secondary'} className="text-xs">{sp.is_active !== false ? 'Actif' : 'Inactif'}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => product && setEditingProduct({ storeProduct: sp, product })}><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={async () => { try { await removeProduct.mutateAsync(sp.product_id); toast.success('Retiré'); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stock" className="mt-3">
          {selected.size > 0 && (
            <div className="p-3 mb-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-primary/5">
              <span className="text-sm font-medium">{selected.size} sélectionné(s)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Annuler</Button>
                <Button size="sm" className="gap-1" onClick={handlePublishSelected}><Globe className="h-3.5 w-3.5" /> Publier</Button>
              </div>
            </div>
          )}
          {filteredUnpublished.length === 0 ? (
            <Card><CardContent className="py-10 sm:py-14 text-center space-y-2">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">{unpublished.length === 0 ? 'Tous les produits sont publiés' : 'Aucun résultat'}</p>
            </CardContent></Card>
          ) : isMobile ? (
            <div className="space-y-2">
              {filteredUnpublished.map(p => (
                <StockProductCard
                  key={p.id}
                  product={p}
                  selected={selected.has(p.id)}
                  onToggle={() => toggleSelect(p.id)}
                  onlinePrice={onlinePrices[p.id] ?? p.price}
                  onPriceChange={v => setOnlinePrices(prev => ({ ...prev, [p.id]: v }))}
                  onPublish={async () => { try { await publishProducts.mutateAsync([{ product_id: p.id, online_price: onlinePrices[p.id] || p.price }]); toast.success('Publié !'); } catch (e: any) { toast.error(e.message); } }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="w-10"><Checkbox checked={selected.size === filteredUnpublished.length && filteredUnpublished.length > 0} onCheckedChange={checked => setSelected(checked ? new Set(filteredUnpublished.map(p => p.id)) : new Set())} /></TableHead>
                    <TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Prix stock</TableHead><TableHead>Prix en ligne</TableHead><TableHead className="text-right">Action</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredUnpublished.map(p => (
                      <TableRow key={p.id} className={selected.has(p.id) ? 'bg-primary/5' : ''}>
                        <TableCell><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                        <TableCell><div className="flex items-center gap-3"><ProductIcon product={p} /><span className="font-medium text-sm">{p.name}</span></div></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.category || '—'}</TableCell>
                        <TableCell className="text-sm">{p.price?.toLocaleString()} XOF</TableCell>
                        <TableCell>
                          <Input type="number" className="w-28 h-8 text-sm" value={onlinePrices[p.id] ?? p.price} onChange={e => setOnlinePrices(prev => ({ ...prev, [p.id]: Number(e.target.value) }))} onClick={e => e.stopPropagation()} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="gap-1" onClick={async () => { try { await publishProducts.mutateAsync([{ product_id: p.id, online_price: onlinePrices[p.id] || p.price }]); toast.success('Publié !'); } catch (e: any) { toast.error(e.message); } }}>
                            <Globe className="h-3.5 w-3.5" /> Publier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateProductDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} storeId={store.id} onCreated={refreshAll} />
      {editingProduct && (
        <StoreProductEditDialog storeProduct={editingProduct.storeProduct} product={editingProduct.product} storeId={store.id} open={true} onOpenChange={v => !v && setEditingProduct(null)} onSaved={refreshAll} />
      )}
    </div>
  );
}
