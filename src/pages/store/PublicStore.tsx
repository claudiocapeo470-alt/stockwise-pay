import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import { Search, ShoppingCart, Heart, X, Plus, Minus, Star, Home, Store, User, Grid2X2, MessageCircle, Moon, Sun, ChevronRight } from "lucide-react";

interface StoreData { id: string; name: string; slug: string; description: string | null; primary_color: string; logo_url: string | null; banner_url: string | null; show_stock: boolean; allow_orders: boolean; delivery_fee: number; free_delivery_minimum: number; whatsapp: string | null; phone: string | null; email: string | null; address: string | null; theme_id?: string; }
interface ProductData { id: string; name: string; price: number; quantity: number; icon_emoji: string; icon_bg_color: string; category: string | null; description: string | null; online_price: number | null; is_featured: boolean; image_url: string | null; }
interface CartItem { id: string; name: string; price: number; quantity: number; icon_emoji: string; image_url: string | null; }

type StorePage = "home" | "shop" | "account" | "search" | "categories";

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<StorePage>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem(`cart-${slug}`) || '[]'); } catch { return []; } });
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem(`favs-${slug}`) || '[]')); } catch { return new Set(); } });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "+225 ", email: "", address: "", notes: "", payment_method: "cash_on_delivery" });
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(`cart-${slug}`, JSON.stringify(cart)); }, [cart, slug]);
  useEffect(() => { localStorage.setItem(`favs-${slug}`, JSON.stringify([...favorites])); }, [favorites, slug]);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: storeData } = await supabase.from('online_store').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData as any);
      const from = 0;
      const to = PAGE_SIZE - 1;
      const { data: sp, count } = await supabase.from('store_products').select('*, products(*)', { count: 'exact' }).eq('store_id', storeData.id).order('is_featured', { ascending: false }).range(from, to);
      const mapped = (sp || []).map((s: any) => ({ id: s.products.id, name: s.products.name, price: s.online_price || s.products.price, quantity: s.products.quantity, icon_emoji: s.products.icon_emoji || '📦', icon_bg_color: s.products.icon_bg_color || 'bg-blue', category: s.products.category, description: s.products.description, online_price: s.online_price, is_featured: s.is_featured, image_url: s.products.image_url || null }));
      setProducts(mapped);
      setHasMore((count || 0) > PAGE_SIZE);
      setPage(0);
      setLoading(false);
    };
    load();
  }, [slug]);

  const loadMore = async () => {
    if (!store || !hasMore) return;
    const nextPage = page + 1;
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data: sp, count } = await supabase.from('store_products').select('*, products(*)', { count: 'exact' }).eq('store_id', store.id).order('is_featured', { ascending: false }).range(from, to);
    const mapped = (sp || []).map((s: any) => ({ id: s.products.id, name: s.products.name, price: s.online_price || s.products.price, quantity: s.products.quantity, icon_emoji: s.products.icon_emoji || '📦', icon_bg_color: s.products.icon_bg_color || 'bg-blue', category: s.products.category, description: s.products.description, online_price: s.online_price, is_featured: s.is_featured, image_url: s.products.image_url || null }));
    setProducts(prev => [...prev, ...mapped]);
    setHasMore((count || 0) > to + 1);
    setPage(nextPage);
  };

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort() as string[], [products]);
  const filtered = useMemo(() => { let f = products; if (activeCategory) f = f.filter(p => p.category === activeCategory); if (search) { const q = search.toLowerCase(); f = f.filter(p => p.name.toLowerCase().includes(q)); } return f; }, [products, activeCategory, search]);
  const featuredProducts = useMemo(() => products.filter(p => p.is_featured), [products]);

  const addToCart = (p: ProductData) => { if (p.quantity <= 0) return; setCart(prev => { const ex = prev.find(i => i.id === p.id); if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { id: p.id, name: p.name, price: p.price, quantity: 1, icon_emoji: p.icon_emoji, image_url: p.image_url }]; }); };
  const updateQty = (id: string, d: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0));
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = store?.free_delivery_minimum && subtotal >= store.free_delivery_minimum ? 0 : (store?.delivery_fee || 0);
  const cartTotal = subtotal + deliveryFee;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const toggleFav = (id: string) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const submitOrder = async () => {
    if (!store || !orderForm.name || !orderForm.phone) return;
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const items = cart.map(i => ({ name: i.name, icon: i.icon_emoji, price: i.price, quantity: i.quantity }));
    const { error } = await supabase.from('store_orders').insert({ store_id: store.id, order_number: orderNumber, customer_name: orderForm.name, customer_phone: orderForm.phone, customer_email: orderForm.email || null, customer_address: orderForm.address || null, items, subtotal, delivery_fee: deliveryFee, total: cartTotal, payment_method: orderForm.payment_method, notes: orderForm.notes || null });
    if (error) { alert("Erreur: " + error.message); return; }
    setOrderSuccess(orderNumber); setCart([]); setShowCheckout(false); setShowCart(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>;
  if (!store) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-muted-foreground">Boutique introuvable</p></div>;

  const color = store.primary_color || '#16a34a';
  const themeId = (store as any).theme_id || 'classic';

  if (orderSuccess) return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl">✅</div><h1 className="text-2xl font-bold">Commande confirmée !</h1>
        <p className="text-muted-foreground">Numéro : <span className="font-mono font-bold">{orderSuccess}</span></p>
        <Button onClick={() => { setOrderSuccess(null); setOrderForm({ name: "", phone: "+225 ", email: "", address: "", notes: "", payment_method: "cash_on_delivery" }); }} style={{ background: color }} className="text-white">Retour</Button>
      </div>
    </div>
  );

  const ProductImage = ({ product, size = "md" }: { product: ProductData; size?: "sm" | "md" | "lg" }) => {
    const sizeClass = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-full w-full" : "h-16 w-16";
    if (product.image_url) return <img src={product.image_url} alt={product.name} className={`${sizeClass} object-cover rounded-lg`} />;
    return <div className={`${sizeClass} rounded-lg flex items-center justify-center`} style={getIconBgStyle(product.icon_bg_color)}><span className={size === "sm" ? "text-xl" : size === "lg" ? "text-5xl" : "text-3xl"}>{product.icon_emoji}</span></div>;
  };

  // Theme-based grid columns
  const gridCols = themeId === 'modern' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : themeId === 'minimal' ? 'grid-cols-1 sm:grid-cols-2' : themeId === 'boutique' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  const cardRadius = themeId === 'minimal' ? 'rounded-none' : themeId === 'boutique' ? 'rounded-3xl' : 'rounded-2xl';

  const ProductCard = ({ product }: { product: ProductData }) => (
    <div className={`bg-card ${cardRadius} border border-border overflow-hidden hover:shadow-lg transition-all group relative`}>
      <button onClick={() => toggleFav(product.id)} className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center">
        <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
      </button>
      {product.is_featured && <Badge className="absolute top-2 left-2 z-10 text-[10px] text-white" style={{ background: color }}>⭐ Vedette</Badge>}
      <div className="aspect-square flex items-center justify-center bg-muted/30 overflow-hidden"><ProductImage product={product} size="lg" /></div>
      <div className="p-3 space-y-1">
        <p className={`font-semibold text-sm truncate ${themeId === 'minimal' ? 'text-lg' : ''}`}>{product.name}</p>
        {product.category && <p className="text-xs text-muted-foreground">{product.category}</p>}
        <p className="font-extrabold text-base" style={{ color }}>{product.price.toLocaleString()} FCFA</p>
        {store.show_stock && product.quantity > 0 && <p className="text-xs text-muted-foreground">{product.quantity} en stock</p>}
        {product.quantity === 0 ? <div className="text-xs text-destructive font-medium mt-1">Rupture de stock</div> : (
          <Button size="sm" className="w-full mt-2 gap-1 text-white" style={{ background: color }} onClick={() => addToCart(product)}><ShoppingCart className="h-3.5 w-3.5" /> Ajouter</Button>
        )}
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="pb-20">
      {themeId !== 'minimal' && (
        <div className={`relative ${themeId === 'modern' ? 'h-80 sm:h-96' : 'h-64 sm:h-80'} bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden`}>
          {store.banner_url && <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center text-white px-4 space-y-3">
            <h1 className={`${themeId === 'modern' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-bold`}>{store.description || `Bienvenue chez ${store.name}`}</h1>
            <Button onClick={() => setActivePage("shop")} className="text-white gap-2 rounded-full px-6 h-12" style={{ background: color }}><ShoppingCart className="h-4 w-4" /> Commencer <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      {themeId === 'minimal' && <div className="px-4 py-8"><h1 className="text-3xl font-light tracking-tight">{store.name}</h1>{store.description && <p className="text-muted-foreground mt-2">{store.description}</p>}</div>}
      {themeId === 'magazine' && featuredProducts.length > 0 && (
        <div className="px-4 py-6"><h2 className="text-lg font-bold mb-4">❤️ Coups de cœur</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">{featuredProducts.slice(0, 6).map(p => <div key={p.id} className="min-w-[160px]"><ProductCard product={p} /></div>)}</div>
        </div>
      )}
      {featuredProducts.length > 0 && themeId !== 'magazine' && (
        <div className="px-4 py-6"><h2 className="text-lg font-bold mb-4">⭐ Produits vedettes</h2><div className={`grid ${gridCols} gap-3`}>{featuredProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div></div>
      )}
      {categories.length > 0 && (
        <div className="px-4 py-6"><h2 className="text-lg font-bold mb-4">📂 Catégories</h2><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{categories.map(cat => (<button key={cat} onClick={() => { setActiveCategory(cat); setActivePage("shop"); }} className="p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all text-left"><p className="font-semibold text-sm">{cat}</p><p className="text-xs text-muted-foreground">{products.filter(p => p.category === cat).length} produits</p></button>))}</div></div>
      )}
      <div className="px-4 py-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">🛍️ Nos produits</h2><Button variant="ghost" size="sm" onClick={() => setActivePage("shop")} style={{ color }}>Voir tout</Button></div><div className={`grid ${gridCols} gap-3`}>{products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}</div></div>
    </div>
  );

  const ShopPage = () => (
    <div className="pb-20">
      <div className="overflow-x-auto border-b border-border"><div className="flex gap-2 p-3">
        <button onClick={() => setActiveCategory(null)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${!activeCategory ? 'text-white' : 'bg-muted text-muted-foreground'}`} style={!activeCategory ? { background: color } : {}}>Tous</button>
        {categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${activeCategory === cat ? 'text-white' : 'bg-muted text-muted-foreground'}`} style={activeCategory === cat ? { background: color } : {}}>{cat}</button>))}
      </div></div>
      <div className="px-4 py-4"><div className={`grid ${gridCols} gap-3`}>{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div>{filtered.length === 0 && <p className="text-center text-muted-foreground py-16">Aucun produit trouvé</p>}{hasMore && !activeCategory && !search && <div className="text-center mt-6"><Button variant="outline" onClick={loadMore} className="rounded-full px-8">Charger plus</Button></div>}</div>
    </div>
  );

  const AccountPage = () => (<div className="pb-20 px-4 py-6 space-y-4"><h2 className="text-lg font-bold">👤 Mon compte</h2><div className="space-y-3"><button onClick={() => setShowCart(true)} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted text-left"><ShoppingCart className="h-5 w-5 text-muted-foreground" /><div className="flex-1"><p className="font-medium">Mon panier</p><p className="text-xs text-muted-foreground">{totalItems} article(s)</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></button><button className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted text-left"><Heart className="h-5 w-5 text-muted-foreground" /><div className="flex-1"><p className="font-medium">Mes favoris</p><p className="text-xs text-muted-foreground">{favorites.size} produit(s)</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>{store.address && <div className="p-4 rounded-xl border border-border bg-card"><p className="font-medium text-sm">📍 Adresse</p><p className="text-sm text-muted-foreground mt-1">{store.address}</p></div>}</div></div>);

  const SearchPage = () => (<div className="pb-20 px-4 py-4 space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-12 text-base rounded-full" autoFocus /></div>{search ? <div className={`grid ${gridCols} gap-3`}>{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="text-center text-muted-foreground py-16"><Search className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Tapez pour rechercher</p></div>}</div>);

  const CategoriesPage = () => (<div className="pb-20 px-4 py-6 space-y-4"><h2 className="text-lg font-bold">📂 Catégories</h2><div className="grid grid-cols-2 gap-3"><button onClick={() => { setActiveCategory(null); setActivePage("shop"); }} className="p-4 rounded-2xl border border-border bg-card hover:shadow-md text-left"><p className="text-2xl mb-2">🛍️</p><p className="font-semibold text-sm">Tous</p><p className="text-xs text-muted-foreground">{products.length} produits</p></button>{categories.map(cat => (<button key={cat} onClick={() => { setActiveCategory(cat); setActivePage("shop"); }} className="p-4 rounded-2xl border border-border bg-card hover:shadow-md text-left"><p className="text-2xl mb-2">📦</p><p className="font-semibold text-sm">{cat}</p><p className="text-xs text-muted-foreground">{products.filter(p => p.category === cat).length} produits</p></button>))}</div></div>);

  const navItems: { page: StorePage; icon: typeof Home; label: string }[] = [
    { page: "home", icon: Home, label: "Accueil" }, { page: "shop", icon: Store, label: "Boutique" }, { page: "account", icon: User, label: "Compte" }, { page: "search", icon: Search, label: "Recherche" }, { page: "categories", icon: Grid2X2, label: "Catégories" },
  ];

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <button className="p-1"><span className="sr-only">Menu</span></button>
          <div className="flex items-center gap-2">{store.logo_url ? <img src={store.logo_url} alt={store.name} className="h-9 w-9 rounded-lg object-cover" /> : <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: color }}>{store.name.substring(0, 2).toUpperCase()}</div>}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="h-9 w-9 rounded-full border border-border flex items-center justify-center">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={() => setShowCart(true)} className="relative h-9 w-9 flex items-center justify-center"><ShoppingCart className="h-5 w-5" />{totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ background: color }}>{totalItems}</span>}</button>
          </div>
        </div>
      </header>
      {activePage === "home" && <HomePage />}
      {activePage === "shop" && <ShopPage />}
      {activePage === "account" && <AccountPage />}
      {activePage === "search" && <SearchPage />}
      {activePage === "categories" && <CategoriesPage />}
      {store.whatsapp && <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-20 left-4 z-30 h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><MessageCircle className="h-6 w-6" /></a>}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background"><div className="flex items-center justify-around h-16">{navItems.map(item => { const active = activePage === item.page; return (<button key={item.page} onClick={() => { setActivePage(item.page); if (item.page !== "search") setSearch(""); }} className="flex flex-col items-center justify-center flex-1 h-full gap-1"><item.icon className={`h-5 w-5 ${active ? '' : 'text-muted-foreground'}`} style={active ? { color } : {}} strokeWidth={active ? 2.5 : 2} /><span className={`text-[10px] ${active ? 'font-semibold' : 'text-muted-foreground'}`} style={active ? { color } : {}}>{item.label}</span></button>); })}</div></nav>
      {showCart && <div className="fixed inset-0 z-50"><div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} /><div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border flex flex-col"><div className="p-4 border-b border-border flex items-center justify-between"><h2 className="font-bold text-lg">🛒 Panier ({totalItems})</h2><Button variant="ghost" size="icon" onClick={() => setShowCart(false)}><X className="h-5 w-5" /></Button></div><div className="flex-1 overflow-y-auto p-4 space-y-3">{cart.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">{item.image_url ? <img src={item.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="text-2xl">{item.icon_emoji}</span>}<div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.name}</p><p className="text-sm font-bold" style={{ color }}>{item.price.toLocaleString()} FCFA</p></div><div className="flex items-center gap-1"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus className="h-3 w-3" /></Button><span className="w-6 text-center text-sm font-bold">{item.quantity}</span><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus className="h-3 w-3" /></Button></div><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}><X className="h-4 w-4" /></Button></div>))}{cart.length === 0 && <p className="text-center text-muted-foreground py-8">Panier vide</p>}</div>{cart.length > 0 && <div className="p-4 border-t border-border space-y-3"><div className="space-y-1 text-sm"><div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div><div className="flex justify-between"><span>Livraison</span><span>{deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toLocaleString()} FCFA`}</span></div><div className="flex justify-between font-bold text-lg"><span>TOTAL</span><span>{cartTotal.toLocaleString()} FCFA</span></div></div><Button className="w-full h-12 text-white font-bold rounded-full" style={{ background: color }} onClick={() => { setShowCart(false); setShowCheckout(true); }}>🛍️ Commander</Button></div>}</div></div>}
      {showCheckout && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-background rounded-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4"><div className="flex items-center justify-between"><h2 className="font-bold text-lg">📋 Finaliser</h2><Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)}><X className="h-5 w-5" /></Button></div><div className="space-y-3"><div><label className="text-sm font-medium">Nom *</label><Input value={orderForm.name} onChange={e => setOrderForm(p => ({ ...p, name: e.target.value }))} /></div><div><label className="text-sm font-medium">Téléphone *</label><Input value={orderForm.phone} onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))} /></div><div><label className="text-sm font-medium">Email</label><Input value={orderForm.email} onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))} type="email" /></div><div><label className="text-sm font-medium">Adresse</label><Input value={orderForm.address} onChange={e => setOrderForm(p => ({ ...p, address: e.target.value }))} /></div><div><label className="text-sm font-medium">Notes</label><Input value={orderForm.notes} onChange={e => setOrderForm(p => ({ ...p, notes: e.target.value }))} /></div><div className="space-y-2"><label className="text-sm font-medium">Paiement</label>{[{ v: "cash_on_delivery", l: "À la livraison" }, { v: "wave", l: "Wave" }, { v: "orange_money", l: "Orange Money" }, { v: "mtn_money", l: "MTN Money" }].map(m => (<label key={m.v} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="pm" value={m.v} checked={orderForm.payment_method === m.v} onChange={() => setOrderForm(p => ({ ...p, payment_method: m.v }))} />{m.l}</label>))}</div><div className="border-t pt-3 text-sm"><p>{cart.length} articles · Total : <span className="font-bold">{cartTotal.toLocaleString()} FCFA</span></p></div><Button className="w-full h-12 text-white font-bold rounded-full" style={{ background: color }} onClick={submitOrder} disabled={!orderForm.name || !orderForm.phone}>✅ Confirmer</Button></div></div></div>}
    </div>
  );
}
