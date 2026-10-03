import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListShell, ListRow, ListAvatar, ListBadge, ListEmpty } from '@/components/layout/MinimalList';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useProducts } from '@/hooks/useProducts';
import { useOnlineStore, useStoreProducts } from '@/hooks/useOnlineStore';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Globe, Package, Loader2, ImageIcon, X, Check, Camera, Info, Tag, Boxes, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreProductEditDialog } from '@/components/store/StoreProductEditDialog';
import { RichTextEditor } from '@/components/stocks/RichTextEditor';
import { StoreHeader } from '@/components/store/StoreHeader';
import { uploadProductImage } from '@/lib/uploadProductImage';
import { PageActionBar } from '@/components/layout/PageActionBar';
import { SectionHeading } from '@/components/layout/PageShell';

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

  const uploadFile = async (file: File, _prefix: string): Promise<string | null> => {
    if (!user) return null;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5 Mo)'); return null; }
    try {
      const { url } = await uploadProductImage(file);
      return url;
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'upload");
      return null;
    }
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

  const STEPS = [
    { label: 'Photos', icon: Camera, desc: 'Ajoutez les photos de votre produit' },
    { label: 'Infos', icon: Info, desc: 'Nom, prix et description' },
    { label: 'Catégorie', icon: Tag, desc: 'Choisissez ou créez une catégorie' },
    { label: 'Stock', icon: Boxes, desc: 'Quantité et seuil de rupture' },
  ];
  const totalSteps = STEPS.length;
  const canNext = step === 1 ? true : step === 2 ? !!form.name.trim() && !!form.price : true;
  const progressPct = (step / totalSteps) * 100;
  const StepIcon = STEPS[step - 1].icon;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[92vh] sm:h-[90vh] p-0 rounded-t-3xl border-t-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Header with drag handle + progress bar (no numbers) */}
        <div className="flex-shrink-0 pt-3 pb-2 px-5 bg-background border-b border-border">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted mb-3" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold truncate">Nouveau produit · {STEPS[step - 1].label}</p>
              <p className="text-xs text-muted-foreground truncate">{STEPS[step - 1].desc}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                        <div className="w-full h-full bg-muted flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground/60" /></div>
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


        {/* Footer actions */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-border bg-background">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="rounded-full gap-1"><ChevronLeft className="h-4 w-4" />Précédent</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-full">Annuler</Button>
          )}
          {step < totalSteps ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext} className="rounded-full gap-1">Suivant<ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <Button size="sm" onClick={handleCreate} disabled={saving} className="rounded-full">{saving ? 'Création...' : 'Créer et publier'}</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function StoreProducts() {
  const { store } = useOnlineStore();
  const { products, deleteProduct } = useProducts();
  const { storeProducts, publishProducts, removeProduct } = useStoreProducts(store?.id);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'online' | 'stock'>('online');
  const [editingProduct, setEditingProduct] = useState<{ storeProduct: any; product: any } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const publishOne = async (p: any) => {
    setPublishingId(p.id);
    try {
      await publishProducts.mutateAsync([{ product_id: p.id, online_price: p.price || 0 }]);
      toast.success(`${p.name} publié !`);
    } catch (e: any) { toast.error(e.message); }
    finally { setPublishingId(null); }
  };

  const publishedIds = new Set(storeProducts.map((sp: any) => sp.product_id));
  const unpublished = products.filter(p => !publishedIds.has(p.id));
  const filteredUnpublished = unpublished.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredOnline = storeProducts.filter((sp: any) => !search || sp.products?.name?.toLowerCase().includes(search.toLowerCase()));

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
      <StoreHeader
        title="Produits en ligne"
        onSave={async () => { refreshAll(); toast.success('Modifications enregistrées'); }}
      />


      {/* Recherche + création : barre unifiée (FAB sur mobile) */}
      <PageActionBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un produit..."
        primary={
          <Button onClick={() => setShowCreateDialog(true)} className="h-11 rounded-xl gap-1.5">
            <Plus className="h-5 w-5" /> <span>Créer un produit</span>
          </Button>
        }
      />




      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => setTab("online")}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${tab === "online" ? "border-foreground bg-foreground text-background" : "border-foreground/60 text-foreground hover:bg-foreground/5"}`}
          >
            En ligne · {storeProducts.length}
          </button>
          <button
            onClick={() => setTab("stock")}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${tab === "stock" ? "border-foreground bg-foreground text-background" : "border-foreground/60 text-foreground hover:bg-foreground/5"}`}
          >
            Stock · {unpublished.length}
          </button>
        </div>
      </div>

      {tab === "online" ? (
        <>
          <SectionHeading
            title="Catalogue de la boutique"
            count={filteredOnline.length}
          />

          {filteredOnline.length === 0 ? (
            <ListEmpty
              icon={<Globe className="h-5 w-5" />}
              title={storeProducts.length === 0 ? "Aucun produit en ligne" : "Aucun résultat"}
              description={storeProducts.length === 0 ? "Créez ou publiez votre premier produit" : "Aucun produit trouvé pour cette recherche"}
            />
          ) : (
            <ListShell>
              {filteredOnline.map((sp: any) => (
                <ListRow
                  key={sp.id}
                  leading={
                    <ListAvatar src={sp.products?.image_url} alt={sp.products?.name || "Produit"} icon={<Package className="h-5 w-5" />} tone="success" />
                  }
                  title={sp.products?.name || '—'}
                  badge={<ListBadge className="bg-success/10 text-success">Publié</ListBadge>}
                  subtitle={sp.products?.category || 'Sans catégorie'}
                  meta={sp.products?.quantity != null ? `${sp.products.quantity} en stock` : undefined}
                  value={`${sp.online_price?.toLocaleString('de-DE')} XOF`}
                  onClick={() => sp.products && setEditingProduct({ storeProduct: sp, product: sp.products })}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label={`Actions pour ${sp.products?.name || "ce produit"}`}><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => sp.products && setEditingProduct({ storeProduct: sp, product: sp.products })}><Edit2 className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => {
                          try {
                            await removeProduct.mutateAsync(sp.product_id);
                            toast.success('Produit dépublié');
                          } catch (e: any) { toast.error(e.message); }
                        }}><Globe className="mr-2 h-4 w-4" />Dépublier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => sp.products && setConfirmDelete({ id: sp.product_id, name: sp.products.name })}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              ))}
            </ListShell>
          )}
        </>
      ) : (
        <>
          <SectionHeading
            title="Produits en stock"
            count={filteredUnpublished.length}
          />
          {filteredUnpublished.length === 0 ? (
            <ListEmpty
              icon={<Package className="h-5 w-5" />}
              title={unpublished.length === 0 ? "Tous les produits sont publiés" : "Aucun résultat"}
              description={unpublished.length === 0 ? "Les produits publiés apparaissent dans l’onglet En ligne" : "Aucun produit trouvé pour cette recherche"}
            />
          ) : (
            <ListShell>
              {filteredUnpublished.map(p => (
                <ListRow
                  key={p.id}
                  leading={<ListAvatar src={p.image_url} alt={p.name} icon={<Package className="h-5 w-5" />} tone={p.quantity > 0 ? "warning" : "destructive"} />}
                  title={p.name}
                  badge={
                    <ListBadge className={p.quantity > 0 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                      {p.quantity > 0 ? `${p.quantity} en stock` : 'Rupture'}
                    </ListBadge>
                  }
                  subtitle={p.category || 'Sans catégorie'}
                  meta="Non publié"
                  value={`${p.price?.toLocaleString('de-DE')} XOF`}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label={`Actions pour ${p.name}`}><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={publishingId === p.id} onClick={() => publishOne(p)}>
                          {publishingId === p.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}Publier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete({ id: p.id, name: p.name })}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              ))}
            </ListShell>
          )}
        </>
      )}

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
