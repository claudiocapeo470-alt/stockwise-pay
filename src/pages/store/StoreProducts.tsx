import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts } from '@/hooks/useProducts';
import { useOnlineStore, useStoreProducts } from '@/hooks/useOnlineStore';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Globe, Package, Search, Upload, Loader2, ImageIcon, X, Check } from 'lucide-react';
import { StoreProductEditDialog } from '@/components/store/StoreProductEditDialog';
import { RichTextEditor } from '@/components/stocks/RichTextEditor';

function ProductIcon({ product }: { product: any }) {
  if (product.image_url) return <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />;
  return (
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
      {product.icon_emoji || '📦'}
    </div>
  );
}

interface CategoryItem { id?: string; name: string; image_url: string | null; }

function CreateProductDialog({ open, onClose, storeId, onCreated }: { open: boolean; onClose: () => void; storeId: string; onCreated: () => void }) {
  const { addProduct } = useProducts();
  const { publishProducts } = useStoreProducts(storeId);
  const { user, isEmployee, memberInfo } = useAuth();
  const effectiveUserId = isEmployee ? memberInfo?.owner_id : user?.id;
  const fileRef = useRef<HTMLInputElement>(null);
  const catFileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const MAX_IMAGES = 8;
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', quantity: '0', min_quantity: '5', category: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [addingNewCat, setAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState<string>('');
  const [savingCat, setSavingCat] = useState(false);

  const reset = () => {
    setForm({ name: '', description: '', price: '', quantity: '0', min_quantity: '5', category: '' });
    setImages([]); setStep(1); setAddingNewCat(false); setNewCatName(''); setNewCatImage('');
  };

  const loadCategories = React.useCallback(async () => {
    if (!effectiveUserId) return;
    const { data: cats } = await supabase
      .from('product_categories').select('id, name, image_url').eq('user_id', effectiveUserId);
    const map = new Map<string, CategoryItem>();
    (cats || []).forEach((c: any) => map.set(c.name, { id: c.id, name: c.name, image_url: c.image_url }));
    // Inclure les noms de catégories utilisés sur des produits existants même sans image
    const { data: prods } = await supabase
      .from('products').select('category').eq('user_id', effectiveUserId);
    (prods || []).forEach((p: any) => {
      if (p.category && !map.has(p.category)) map.set(p.category, { name: p.category, image_url: null });
    });
    setCategories([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
  }, [effectiveUserId]);

  React.useEffect(() => {
    if (!open) return;
    setStep(1); reset();
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    if (!user) return null;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5 Mo)'); return null; }
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); return null; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of toUpload) {
        const url = await uploadFile(f, 'product');
        if (url) urls.push(url);
      }
      setImages(prev => [...prev, ...urls]);
      if (urls.length) toast.success(`${urls.length} image(s) ajoutée(s)`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, 'cat');
    if (url) setNewCatImage(url);
    if (catFileRef.current) catFileRef.current.value = '';
  };

  const handleSaveNewCat = async () => {
    const n = newCatName.trim();
    if (!n || !effectiveUserId) return;
    setSavingCat(true);
    try {
      const { data, error } = await supabase.from('product_categories')
        .insert({ name: n, user_id: effectiveUserId, icon_emoji: '📦', image_url: newCatImage || null })
        .select().single();
      if (error) throw error;
      setCategories(prev => [...prev, { id: data.id, name: n, image_url: newCatImage || null }].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(p => ({ ...p, category: n }));
      setNewCatName(''); setNewCatImage(''); setAddingNewCat(false);
      toast.success('Catégorie créée');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingCat(false); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Le nom du produit est requis'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { toast.error('Entrez un prix valide'); return; }
    setSaving(true);
    try {
      const mainImage = images[0] || null;
      const newProduct = await addProduct.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        quantity: Number(form.quantity) || 0,
        min_quantity: Number(form.min_quantity) || 5,
        category: form.category.trim() || null,
        sku: null, icon_emoji: '🛍️', icon_bg_color: null,
        image_url: mainImage,
      });
      // Sauvegarde des images additionnelles
      if (images.length > 1 && user) {
        const rows = images.slice(1).map((url, i) => ({
          product_id: newProduct.id, user_id: user.id, image_url: url, sort_order: i + 1,
        }));
        await supabase.from('product_images').insert(rows);
      }
      await publishProducts.mutateAsync([{ product_id: newProduct.id, online_price: Number(form.price) }]);
      toast.success('Produit créé et publié !');
      onCreated(); reset(); onClose();
    } catch (e: any) { toast.error('Erreur', { description: e.message }); }
    finally { setSaving(false); }
  };

  const STEPS = ['Photos', 'Infos', 'Catégorie', 'Stock'];
  const totalSteps = STEPS.length;
  const canNext = step === 1 ? true : step === 2 ? !!form.name.trim() && !!form.price : true;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Nouveau produit</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {STEPS.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <button onClick={() => setStep(s)} className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>{s < step ? <Check className="h-3.5 w-3.5" /> : s}</button>
                {s < totalSteps && <div className={`w-5 h-0.5 ${s < step ? 'bg-emerald-500' : 'bg-muted'}`} />}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mb-2">Étape {step}/{totalSteps} — {STEPS[step - 1]}</p>

        <div className="space-y-4 min-h-[280px]">
          {/* ÉTAPE 1: Photos multiples */}
          {step === 1 && (
            <div className="space-y-2">
              <Label>Photos du produit</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-md">
                        Principal
                      </span>
                    )}
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, k) => k !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /><span className="text-[11px]">Photo</span></>}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleProductImageUpload} className="hidden" />
              <p className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES} images · JPG, PNG, WEBP · Max 5 Mo</p>
              <p className="text-xs text-muted-foreground">La première image sera la photo principale affichée dans la boutique.</p>
            </div>
          )}

          {/* ÉTAPE 2: Infos + description riche */}
          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label>Nom du produit *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: T-shirt Wax" />
              </div>
              <div className="space-y-1.5">
                <Label>Prix (XOF) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <Label>Description pour la boutique en ligne</Label>
                <RichTextEditor
                  value={form.description}
                  onChange={v => setForm(p => ({ ...p, description: v }))}
                  placeholder="Décrivez votre produit avec du texte riche, des images, du gras, de l'italique..."
                />
                <p className="text-xs text-muted-foreground">Utilisez la barre d'outils pour formater: gras, italique, souligné, listes, images.</p>
              </div>
            </>
          )}

          {/* ÉTAPE 3: Catégorie avec images */}
          {step === 3 && (
            <div className="space-y-3">
              <Label>Choisir une catégorie</Label>
              {categories.length === 0 && !addingNewCat && (
                <p className="text-xs text-muted-foreground">Aucune catégorie. Créez-en une nouvelle ci-dessous.</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map(c => {
                  const selected = form.category === c.name;
                  return (
                    <button key={c.name} type="button" onClick={() => setForm(p => ({ ...p, category: c.name }))}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">📦</div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1.5">
                        <p className="text-[11px] font-medium text-white truncate text-center">{c.name}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {!addingNewCat && (
                  <button type="button" onClick={() => setAddingNewCat(true)}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span className="text-[11px]">Nouvelle</span>
                  </button>
                )}
              </div>

              {addingNewCat && (
                <div className="border border-border rounded-2xl p-3 space-y-2 bg-muted/30">
                  <p className="text-xs font-medium">Nouvelle catégorie</p>
                  <div className="flex items-start gap-3">
                    <button type="button" onClick={() => catFileRef.current?.click()}
                      className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary flex items-center justify-center bg-background flex-shrink-0">
                      {newCatImage ? (
                        <img src={newCatImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <input ref={catFileRef} type="file" accept="image/*" onChange={handleCatImageUpload} className="hidden" />
                    <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nom de la catégorie" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveNewCat(); }} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => { setAddingNewCat(false); setNewCatName(''); setNewCatImage(''); }}>Annuler</Button>
                    <Button size="sm" onClick={handleSaveNewCat} disabled={!newCatName.trim() || savingCat}>
                      {savingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Créer'}
                    </Button>
                  </div>
                </div>
              )}
              {form.category && <p className="text-xs text-muted-foreground">Sélectionnée : <span className="font-medium text-foreground">{form.category}</span></p>}
            </div>
          )}

          {/* ÉTAPE 4: Stock */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantité en stock</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Seuil rupture</Label>
                <Input type="number" value={form.min_quantity} onChange={e => setForm(p => ({ ...p, min_quantity: e.target.value }))} placeholder="5" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>← Précédent</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          )}
          {step < totalSteps ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Suivant →</Button>
          ) : (
            <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? 'Création...' : '✓ Créer et publier'}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mobile card for online products
function OnlineProductCard({ sp, onEdit, onUnpublish, onDelete }: { sp: any; onEdit: () => void; onUnpublish: () => void; onDelete: () => void }) {
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
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Modifier"><Edit2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={onUnpublish} title="Retirer de la boutique"><Globe className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="Supprimer définitivement"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile card for stock products
function StockProductCard({ product, selected, onToggle, onlinePrice, onPriceChange, onPublish, onDelete }: {
  product: any; selected: boolean; onToggle: () => void; onlinePrice: number; onPriceChange: (v: number) => void; onPublish: () => void; onDelete: () => void;
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={onDelete} title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button>
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
  const { products, deleteProduct } = useProducts();
  const { storeProducts, publishProducts, removeProduct } = useStoreProducts(store?.id);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number>>({});
  const [editingProduct, setEditingProduct] = useState<{ storeProduct: any; product: any } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

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

  const handleDeleteForever = async () => {
    if (!confirmDelete) return;
    try {
      // First remove from store_products if published
      await supabase.from('store_products').delete().eq('product_id', confirmDelete.id);
      // Then delete the product itself
      await deleteProduct.mutateAsync(confirmDelete.id);
      toast.success('Produit supprimé définitivement');
      refreshAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirmDelete(null);
    }
  };

  if (!store) return (
    <div className="text-center py-16 space-y-3">
      <Globe className="h-12 w-12 mx-auto text-muted-foreground/30" />
      <p className="text-muted-foreground font-medium">Configurez d'abord votre boutique dans "Ma Boutique"</p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto w-full overflow-x-hidden px-1">
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
                  onUnpublish={async () => { try { await removeProduct.mutateAsync(sp.product_id); toast.success('Retiré de la boutique'); } catch (e: any) { toast.error(e.message); } }}
                  onDelete={() => sp.products && setConfirmDelete({ id: sp.product_id, name: sp.products.name })}
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
                              <Button variant="ghost" size="sm" title="Modifier" onClick={() => product && setEditingProduct({ storeProduct: sp, product })}><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-orange-500" title="Retirer de la boutique" onClick={async () => { try { await removeProduct.mutateAsync(sp.product_id); toast.success('Retiré'); } catch (e: any) { toast.error(e.message); } }}><Globe className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Supprimer définitivement" onClick={() => product && setConfirmDelete({ id: sp.product_id, name: product.name })}><Trash2 className="h-4 w-4" /></Button>
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
                  onDelete={() => setConfirmDelete({ id: p.id, name: p.name })}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="w-10"><Checkbox checked={selected.size === filteredUnpublished.length && filteredUnpublished.length > 0} onCheckedChange={checked => setSelected(checked ? new Set(filteredUnpublished.map(p => p.id)) : new Set())} /></TableHead>
                    <TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Prix stock</TableHead><TableHead>Prix en ligne</TableHead><TableHead className="text-right">Actions</TableHead>
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
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="outline" className="gap-1" onClick={async () => { try { await publishProducts.mutateAsync([{ product_id: p.id, online_price: onlinePrices[p.id] || p.price }]); toast.success('Publié !'); } catch (e: any) { toast.error(e.message); } }}>
                              <Globe className="h-3.5 w-3.5" /> Publier
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" title="Supprimer définitivement" onClick={() => setConfirmDelete({ id: p.id, name: p.name })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      <AlertDialog open={!!confirmDelete} onOpenChange={v => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le produit <strong>{confirmDelete?.name}</strong> sera retiré de la boutique en ligne et supprimé du stock. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForever} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
