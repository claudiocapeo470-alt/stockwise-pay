import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import { Search, ShoppingCart, Heart, X, Plus, Minus, Star } from "lucide-react";

interface StoreData { id: string; name: string; slug: string; description: string | null; primary_color: string; logo_url: string | null; banner_url: string | null; show_stock: boolean; allow_orders: boolean; delivery_fee: number; free_delivery_minimum: number; whatsapp: string | null; phone: string | null; email: string | null; address: string | null; }
interface ProductData { id: string; name: string; price: number; quantity: number; icon_emoji: string; icon_bg_color: string; category: string | null; description: string | null; online_price: number | null; is_featured: boolean; }
interface CartItem { id: string; name: string; price: number; quantity: number; icon_emoji: string; }

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(`cart-${slug}`) || '[]'); } catch { return []; }
  });
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`favs-${slug}`) || '[]')); } catch { return new Set(); }
  });
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
      const { data: sp } = await supabase.from('store_products').select('*, products(*)').eq('store_id', storeData.id);
      const mapped = (sp || []).map((s: any) => ({
        id: s.products.id, name: s.products.name, price: s.online_price || s.products.price,
        quantity: s.products.quantity, icon_emoji: s.products.icon_emoji || '📦',
        icon_bg_color: s.products.icon_bg_color || 'bg-blue', category: s.products.category,
        description: s.products.description, online_price: s.online_price, is_featured: s.is_featured,
      }));
      setProducts(mapped);
      setLoading(false);
    };
    load();
  }, [slug]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort() as string[], [products]);
  const filtered = useMemo(() => {
    let f = products;
    if (activeCategory) f = f.filter(p => p.category === activeCategory);
    if (search) { const q = search.toLowerCase(); f = f.filter(p => p.name.toLowerCase().includes(q)); }
    return f;
  }, [products, activeCategory, search]);

  const addToCart = (p: ProductData) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, quantity: 1, icon_emoji: p.icon_emoji }];
    });
  };

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
    const { error } = await supabase.from('store_orders').insert({
      store_id: store.id, order_number: orderNumber, customer_name: orderForm.name,
      customer_phone: orderForm.phone, customer_email: orderForm.email || null,
      customer_address: orderForm.address || null, items, subtotal, delivery_fee: deliveryFee,
      total: cartTotal, payment_method: orderForm.payment_method, notes: orderForm.notes || null,
    });
    if (error) { alert("Erreur: " + error.message); return; }
    setOrderSuccess(orderNumber);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>;
  if (!store) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-muted-foreground">Boutique introuvable</p></div>;

  const color = store.primary_color || '#4f46e5';

  if (orderSuccess) return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl">✅</div>
        <h1 className="text-2xl font-bold">Commande confirmée !</h1>
        <p className="text-muted-foreground">Numéro : <span className="font-mono font-bold">{orderSuccess}</span></p>
        <p className="text-sm text-muted-foreground">Nous vous contacterons au {orderForm.phone} pour confirmer.</p>
        <Button onClick={() => { setOrderSuccess(null); setOrderForm({ name: "", phone: "+225 ", email: "", address: "", notes: "", payment_method: "cash_on_delivery" }); }}>Retour à la boutique</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url && <img src={store.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <span className="font-bold text-lg" style={{ color }}>{store.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9" />
            </div>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowCart(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white" style={{ background: color }}>{totalItems}</span>}
            </Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      {store.banner_url && (
        <div className="h-40 sm:h-56 bg-cover bg-center relative" style={{ backgroundImage: `url(${store.banner_url})` }}>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-3xl font-bold">{store.name}</span></div>
        </div>
      )}

      {/* Mobile search */}
      <div className="sm:hidden p-3 border-b border-border">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" /></div>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto border-b border-border">
        <div className="flex gap-2 p-3 container mx-auto">
          <button onClick={() => setActiveCategory(null)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`} style={!activeCategory ? { background: color } : {}}>Tous</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`} style={activeCategory === cat ? { background: color } : {}}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group relative">
              <button onClick={() => toggleFav(p.id)} className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center">
                <Heart className={`h-4 w-4 ${favorites.has(p.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </button>
              {p.is_featured && <Badge className="absolute top-2 left-2 z-10 text-[10px]" style={{ background: color }}>⭐ Vedette</Badge>}
              <div className="p-4 flex items-center justify-center" style={{ background: `${color}08` }}>
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={getIconBgStyle(p.icon_bg_color)}>
                  <span className="text-[42px]">{p.icon_emoji}</span>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                <p className="font-extrabold" style={{ color }}>{p.price.toLocaleString()} FCFA</p>
                {store.show_stock && p.quantity > 0 && <p className="text-xs text-muted-foreground">{p.quantity} en stock</p>}
                {p.quantity === 0 ? (
                  <div className="text-xs text-destructive font-medium mt-1">Rupture de stock</div>
                ) : (
                  <Button size="sm" className="w-full mt-2 gap-1 text-white" style={{ background: color }} onClick={() => addToCart(p)}>
                    <ShoppingCart className="h-3.5 w-3.5" /> Ajouter
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-16">Aucun produit trouvé</p>}
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">🛒 Mon Panier ({totalItems})</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <span className="text-2xl">{item.icon_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm font-bold" style={{ color }}>{item.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-muted-foreground py-8">Panier vide</p>}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
                  <div className="flex justify-between"><span>Livraison</span><span>{deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toLocaleString()} FCFA`}</span></div>
                  <div className="flex justify-between font-bold text-lg"><span>TOTAL</span><span>{cartTotal.toLocaleString()} FCFA</span></div>
                </div>
                <Button className="w-full h-12 text-white font-bold" style={{ background: color }} onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                  🛍️ Passer la commande
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-bold text-lg">📋 Finaliser ma commande</h2><Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)}><X className="h-5 w-5" /></Button></div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Prénom & Nom *</label><Input value={orderForm.name} onChange={e => setOrderForm(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" required /></div>
              <div><label className="text-sm font-medium">Numéro de téléphone *</label><Input value={orderForm.phone} onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))} placeholder="+225 07 00 00 00" required /></div>
              <div><label className="text-sm font-medium">Email (optionnel)</label><Input value={orderForm.email} onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))} type="email" /></div>
              <div><label className="text-sm font-medium">Adresse de livraison</label><Input value={orderForm.address} onChange={e => setOrderForm(p => ({ ...p, address: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Notes</label><Input value={orderForm.notes} onChange={e => setOrderForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode de paiement</label>
                {[{ v: "cash_on_delivery", l: "Paiement à la livraison" }, { v: "wave", l: "Wave CI" }, { v: "orange_money", l: "Orange Money" }, { v: "mtn_money", l: "MTN Money" }].map(m => (
                  <label key={m.v} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="pm" value={m.v} checked={orderForm.payment_method === m.v} onChange={() => setOrderForm(p => ({ ...p, payment_method: m.v }))} />
                    {m.l}
                  </label>
                ))}
              </div>
              <div className="border-t pt-3 text-sm"><p>{cart.length} articles · Total : <span className="font-bold">{cartTotal.toLocaleString()} FCFA</span></p></div>
              <Button className="w-full h-12 text-white font-bold" style={{ background: color }} onClick={submitOrder} disabled={!orderForm.name || !orderForm.phone}>
                ✅ Confirmer la commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
