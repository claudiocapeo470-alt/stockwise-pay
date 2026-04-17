/**
 * ============================================================
 * PublicStore.tsx — Boutique publique Stocknix
 * Design inspiré de "La Zone" — adapté pour le SaaS Stocknix
 * ============================================================
 *
 * 🎨 PARAMÈTRES DE PERSONNALISATION (modifiez ici) :
 * ──────────────────────────────────────────────────
 *  • Couleur principale     → store.primary_color (depuis Supabase)
 *  • Thème (dark/light)     → state `darkMode` (toggle dans le header)
 *  • Police titres          → FONT_HEADING_URL + famille "Satoshi"
 *  • Police corps           → famille "Inter"
 *  • Taille grille produits → GRID_COLS (lignes ~110)
 *  • Nombre produits vedette → FEATURED_LIMIT (ligne ~115)
 *  • Texte hero par défaut  → HERO_TAGLINE (ligne ~120)
 *  • Avantages affichés     → BENEFITS array (ligne ~125)
 *  • Texte footer           → FOOTER_TEXT (ligne ~135)
 * ──────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import {
  Search, ShoppingCart, Heart, X, Plus, Minus, Star,
  Home, Store, User, Grid2X2, MessageCircle, Moon, Sun,
  ChevronRight, ArrowRight, Truck, Shield, CheckCircle,
  CreditCard, ChevronLeft, Package, Phone, Mail, MapPin,
  Instagram, Facebook
} from "lucide-react";

// ─── PARAMÈTRES DE PERSONNALISATION ───────────────────────────────────────────

/** URL de la police display (changez pour une autre Google Font / Fontshare) */
const FONT_HEADING_URL =
  "https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap";

/** Nombre de colonnes grille produits (mobile / tablet / desktop) */
const GRID_COLS = "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3";

/** Nb max de produits vedettes sur la HomePage */
const FEATURED_LIMIT = 4;

/** Tagline hero par défaut (si store.description est vide) */
const HERO_TAGLINE = "Découvrez nos meilleurs produits, livrés chez vous";

/** Avantages affichés dans la bande bénéfices */
const BENEFITS = [
  { icon: Truck,        text: "Livraison rapide" },
  { icon: CheckCircle, text: "Qualité garantie" },
  { icon: Shield,      text: "Satisfait ou remboursé" },
  { icon: CreditCard,  text: "Paiement à la livraison" },
];

/** Texte bas de page */
const FOOTER_TEXT = "Propulsé par Stocknix";

// ──────────────────────────────────────────────────────────────────────────────

interface StoreData {
  id: string; name: string; slug: string; description: string | null;
  primary_color: string; logo_url: string | null; banner_url: string | null;
  show_stock: boolean; allow_orders: boolean; delivery_fee: number;
  free_delivery_minimum: number; whatsapp: string | null; phone: string | null;
  email: string | null; address: string | null;
}
interface ProductData {
  id: string; name: string; price: number; quantity: number;
  icon_emoji: string; icon_bg_color: string; category: string | null;
  description: string | null; online_price: number | null;
  is_featured: boolean; image_url: string | null;
}
interface CartItem {
  id: string; name: string; price: number; quantity: number;
  icon_emoji: string; image_url: string | null;
}
type StorePage = "home" | "shop" | "account" | "search" | "categories";

// ── CSS injecté inline (design La Zone) ──────────────────────────────────────
const ZONE_STYLES = `
@import url('${FONT_HEADING_URL}');

.lz-root { font-family: 'Inter', system-ui, sans-serif; }
.lz-heading { font-family: 'Satoshi', 'Inter', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

/* Bouton CTA avec glow + shine */
.lz-btn-cta {
  position: relative; overflow: hidden;
  font-weight: 600; transition: all .3s;
  box-shadow: 0 0 0 rgba(34,197,94,0);
}
.lz-btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(34,197,94,.45), 0 0 50px rgba(34,197,94,.2);
}
.lz-btn-cta::before {
  content: '';
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent);
  animation: lz-shine 3s ease-in-out infinite;
}
@keyframes lz-shine { 0%{left:-100%} 50%,100%{left:100%} }

/* PromoBar shine */
.lz-promo-shine {
  animation: lz-promo 4s linear infinite;
}
@keyframes lz-promo { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }

/* Card hover */
.lz-card { transition: transform .3s, box-shadow .3s, border-color .3s; }
.lz-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,.12); }

/* Fade-in */
.lz-fade { opacity: 0; transform: translateY(20px); transition: opacity .6s, transform .6s; }
.lz-fade.visible { opacity: 1; transform: none; }

/* Slide hero text */
@keyframes lz-slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lz-hero-title { animation: lz-slide-up .8s .3s both; }
.lz-hero-sub   { animation: lz-slide-up .8s .5s both; }
.lz-hero-btn   { animation: lz-slide-up .8s .65s both; }

/* Scrollbar hide */
.lz-scroll::-webkit-scrollbar { display: none; }
.lz-scroll { -ms-overflow-style: none; scrollbar-width: none; }

/* Bottom nav safe area */
.lz-nav { padding-bottom: max(env(safe-area-inset-bottom), 4px); }
`;

// ─── Hook: observe quand un élément entre dans le viewport ───────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();

  const [store, setStore]           = useState<StoreData | null>(null);
  const [products, setProducts]     = useState<ProductData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(true);
  const PAGE_SIZE = 20;

  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePage, setActivePage]         = useState<StorePage>("home");
  const [darkMode, setDarkMode]             = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(`cart-${slug}`) || "[]"); }
    catch { return []; }
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`favs-${slug}`) || "[]")); }
    catch { return new Set(); }
  });

  const [showCart, setShowCart]         = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "", phone: "+225 ", email: "", address: "", notes: "",
    payment_method: "cash_on_delivery",
  });
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  // Persist cart / favs
  useEffect(() => { localStorage.setItem(`cart-${slug}`, JSON.stringify(cart)); }, [cart, slug]);
  useEffect(() => { localStorage.setItem(`favs-${slug}`, JSON.stringify([...favorites])); }, [favorites, slug]);

  // Load store + products
  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: storeData } = await supabase
        .from("online_store").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData as StoreData);
      const { data: sp, count } = await supabase
        .from("store_products").select("*, products(*)", { count: "exact" })
        .eq("store_id", storeData.id).order("is_featured", { ascending: false }).range(0, PAGE_SIZE - 1);
      const mapped = (sp || []).map((s: any) => ({
        id: s.products.id, name: s.products.name,
        price: s.online_price ?? s.products.price,
        quantity: s.products.quantity,
        icon_emoji: s.products.icon_emoji || "📦",
        icon_bg_color: s.products.icon_bg_color || "bg-blue",
        category: s.products.category, description: s.products.description,
        online_price: s.online_price, is_featured: s.is_featured,
        image_url: s.products.image_url || null,
      }));
      setProducts(mapped);
      setHasMore((count || 0) > PAGE_SIZE);
      setLoading(false);
    };
    load();
  }, [slug]);

  // Load more
  const loadMore = async () => {
    if (!store || !hasMore) return;
    const np = page + 1;
    const from = np * PAGE_SIZE;
    const { data: sp, count } = await supabase
      .from("store_products").select("*, products(*)", { count: "exact" })
      .eq("store_id", store.id).order("is_featured", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const mapped = (sp || []).map((s: any) => ({
      id: s.products.id, name: s.products.name,
      price: s.online_price ?? s.products.price,
      quantity: s.products.quantity,
      icon_emoji: s.products.icon_emoji || "📦",
      icon_bg_color: s.products.icon_bg_color || "bg-blue",
      category: s.products.category, description: s.products.description,
      online_price: s.online_price, is_featured: s.is_featured,
      image_url: s.products.image_url || null,
    }));
    setProducts(prev => [...prev, ...mapped]);
    setHasMore((count || 0) > from + PAGE_SIZE);
    setPage(np);
  };

  const categories     = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))] as string[], [products]);
  const featured       = useMemo(() => products.filter(p => p.is_featured).slice(0, FEATURED_LIMIT), [products]);
  const filtered       = useMemo(() => {
    let f = products;
    if (activeCategory) f = f.filter(p => p.category === activeCategory);
    if (search) { const q = search.toLowerCase(); f = f.filter(p => p.name.toLowerCase().includes(q)); }
    return f;
  }, [products, activeCategory, search]);

  // Cart helpers
  const addToCart  = (p: ProductData) => {
    if (p.quantity <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, quantity: 1, icon_emoji: p.icon_emoji, image_url: p.image_url }];
    });
  };
  const updateQty  = (id: string, d: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0));
  const toggleFav  = (id: string) =>
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const subtotal    = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = store?.free_delivery_minimum && subtotal >= store.free_delivery_minimum
    ? 0 : (store?.delivery_fee || 0);
  const cartTotal   = subtotal + deliveryFee;
  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);

  // Submit order
  const submitOrder = async () => {
    if (!store || !orderForm.name || !orderForm.phone || submitting) return;
    setSubmitting(true);
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const items = cart.map(i => ({ name: i.name, icon: i.icon_emoji, price: i.price, quantity: i.quantity }));
    const { error } = await supabase.from("store_orders").insert({
      store_id: store.id, order_number: orderNumber,
      customer_name: orderForm.name, customer_phone: orderForm.phone,
      customer_email: orderForm.email || null, customer_address: orderForm.address || null,
      items, subtotal, delivery_fee: deliveryFee, total: cartTotal,
      payment_method: orderForm.payment_method, notes: orderForm.notes || null,
    });
    setSubmitting(false);
    if (error) { alert("Erreur: " + error.message); return; }
    setOrderSuccess(orderNumber);
    setCart([]); setShowCheckout(false); setShowCart(false);
  };

  // ─── Loading / 404 ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ fontFamily: "Inter, sans-serif" }}
      className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Chargement de la boutique…</p>
      </div>
    </div>
  );
  if (!store) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <Package className="h-16 w-16 text-gray-300 mx-auto" />
        <p className="text-xl font-semibold text-gray-600">Boutique introuvable</p>
        <p className="text-sm text-gray-400">Vérifiez l'URL ou contactez le vendeur</p>
      </div>
    </div>
  );

  const color = store.primary_color || "#16a34a";

  // ─── Image produit ───────────────────────────────────────────────────────────
  const ProductImage = ({ product, size = "md" }: { product: ProductData; size?: "sm" | "md" | "lg" }) => {
    const sz = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-full w-full" : "h-16 w-16";
    if (product.image_url)
      return <img src={product.image_url} alt={product.name} className={`${sz} object-cover`} />;
    return (
      <div className={`${sz} flex items-center justify-center`} style={getIconBgStyle(product.icon_bg_color)}>
        <span className={size === "sm" ? "text-xl" : size === "lg" ? "text-5xl" : "text-3xl"}>{product.icon_emoji}</span>
      </div>
    );
  };

  // ─── Carte produit (style La Zone) ──────────────────────────────────────────
  const ProductCard = ({ product }: { product: ProductData }) => (
    <div className="lz-card group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Favori */}
      <button
        onClick={() => toggleFav(product.id)}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur flex items-center justify-center shadow"
      >
        <Heart className={`h-4 w-4 transition-colors ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      {/* Badge vedette */}
      {product.is_featured && (
        <div className="absolute top-2 left-2 z-10 text-[10px] text-white px-2 py-0.5 font-semibold" style={{ background: color }}>
          VEDETTE
        </div>
      )}

      {/* Image carré */}
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <ProductImage product={product} size="lg" />
      </div>

      {/* Infos */}
      <div className="p-3">
        <h3 className="lz-heading text-sm uppercase tracking-wide text-gray-900 dark:text-white truncate mb-1">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
        )}
        <p className="text-base font-extrabold mb-2" style={{ color }}>
          {product.price.toLocaleString("fr-FR")} FCFA
        </p>
        {store.show_stock && product.quantity > 0 && (
          <p className="text-[10px] text-gray-400 mb-2">{product.quantity} en stock</p>
        )}
        {product.quantity === 0 ? (
          <p className="text-xs text-red-500 font-semibold">Rupture de stock</p>
        ) : store.allow_orders ? (
          <button
            onClick={() => addToCart(product)}
            className="lz-btn-cta w-full py-2 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            style={{ background: color }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Ajouter au panier
          </button>
        ) : null}
      </div>
    </div>
  );

  // ─── PromoBar ────────────────────────────────────────────────────────────────
  const PromoBar = () => (
    <section className="relative overflow-hidden py-4 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
      <div className="lz-promo-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 text-center relative z-10">
        <p className="lz-heading text-sm md:text-base font-black uppercase tracking-widest">
          🎉 Boutique officielle de <span className="underline decoration-white/60">{store.name}</span> — Commandez en toute confiance !
        </p>
      </div>
    </section>
  );

  // ─── Section bénéfices ───────────────────────────────────────────────────────
  const BenefitsSection = () => {
    const ref = useFadeIn();
    return (
      <div ref={ref} className="lz-fade py-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {BENEFITS.map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <b.icon className="h-5 w-5 flex-shrink-0" style={{ color }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Page d'accueil ──────────────────────────────────────────────────────────
  const HomePage = () => {
    const featRef  = useFadeIn();
    const catRef   = useFadeIn();
    const statsRef = useFadeIn();
    return (
      <div className="pb-24">
        {/* Hero banner */}
        <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
          {store.banner_url && (
            <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {!store.banner_url && (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}33 0%, #111827 100%)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <p className="lz-hero-sub text-xs uppercase tracking-[0.3em] text-white/60 mb-4">
              Boutique en ligne
            </p>
            <h1 className="lz-heading lz-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              {store.description || HERO_TAGLINE}
            </h1>
            <div className="lz-hero-btn">
              <button
                onClick={() => setActivePage("shop")}
                className="lz-btn-cta inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-full text-white"
                style={{ background: color }}
              >
                <ShoppingCart className="h-4 w-4" />
                Découvrir les produits
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
            <div className="w-0.5 h-8 bg-white/30 rounded-full" />
          </div>
        </section>

        <PromoBar />
        <BenefitsSection />

        {/* Vedettes */}
        {featured.length > 0 && (
          <section>
            <div ref={featRef} className="lz-fade container mx-auto px-4 py-10">
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Sélection</span>
                <h2 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white mt-1">
                  Produits vedettes
                </h2>
              </div>
              <div className={`grid ${GRID_COLS} gap-4`}>
                {featured.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={() => setActivePage("shop")}
                  className="inline-flex items-center gap-2 text-sm font-semibold border border-current px-6 py-3 hover:opacity-70 transition-opacity"
                  style={{ color }}
                >
                  Voir tous les produits <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Catégories */}
        {categories.length > 0 && (
          <section className="bg-gray-50 dark:bg-gray-900">
            <div ref={catRef} className="lz-fade container mx-auto px-4 py-10">
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Explorer</span>
                <h2 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white mt-1">
                  Nos catégories
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setActivePage("shop"); }}
                    className="lz-card group p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-left hover:border-transparent"
                    style={{ ["--hover-color" as any]: color }}
                  >
                    <p className="text-2xl mb-3">📦</p>
                    <p className="lz-heading text-sm text-gray-900 dark:text-white">{cat}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {products.filter(p => p.category === cat).length} produit(s)
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold" style={{ color }}>
                      Voir <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section>
          <div ref={statsRef} className="lz-fade container mx-auto px-4 py-12 text-center">
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              {[
                { value: products.length + "+", label: "Produits" },
                { value: "24h", label: "Livraison" },
                { value: "100%", label: "Satisfaction" },
              ].map(s => (
                <div key={s.label}>
                  <p className="lz-heading text-3xl font-black" style={{ color }}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tous les produits (preview) */}
        <section>
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="lz-heading text-xl md:text-2xl text-gray-900 dark:text-white">
                Tous nos produits
              </h2>
              <button onClick={() => setActivePage("shop")} className="text-sm font-semibold flex items-center gap-1" style={{ color }}>
                Voir tout <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className={`grid ${GRID_COLS} gap-4`}>
              {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ─── Page boutique ───────────────────────────────────────────────────────────
  const ShopPage = () => (
    <div className="pb-24">
      {/* Filtres catégories */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="lz-scroll flex gap-2 px-4 py-3 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-1.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all"
            style={!activeCategory ? { background: color, color: "#fff" } : { background: "transparent", border: "1px solid #e5e7eb", color: "#6b7280" }}
          >Tous</button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all"
              style={activeCategory === cat ? { background: color, color: "#fff" } : { background: "transparent", border: "1px solid #e5e7eb", color: "#6b7280" }}
            >{cat}</button>
          ))}
        </div>
        <div className="px-4 pb-2 text-xs text-gray-400">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          {activeCategory ? ` dans "${activeCategory}"` : ""}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className={`grid ${GRID_COLS} gap-4`}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        {hasMore && !activeCategory && !search && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-current transition-colors rounded-full"
              style={{ color }}
            >Charger plus de produits</button>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Page recherche ──────────────────────────────────────────────────────────
  const SearchPage = () => (
    <div className="pb-24 px-4 py-4">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="w-full pl-11 pr-4 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as any]: color + "60" }}
        />
      </div>
      {search ? (
        <div className={`grid ${GRID_COLS} gap-4`}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-20">
          <Search className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Tapez un nom de produit pour chercher</p>
        </div>
      )}
    </div>
  );

  // ─── Page catégories ─────────────────────────────────────────────────────────
  const CategoriesPage = () => (
    <div className="pb-24 px-4 py-6">
      <h2 className="lz-heading text-xl mb-6 text-gray-900 dark:text-white">Catégories</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setActiveCategory(null); setActivePage("shop"); }}
          className="lz-card p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-left"
        >
          <p className="text-2xl mb-3">🛍️</p>
          <p className="lz-heading text-sm text-gray-900 dark:text-white">Tous</p>
          <p className="text-xs text-gray-400">{products.length} produits</p>
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setActivePage("shop"); }}
            className="lz-card p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-left"
          >
            <p className="text-2xl mb-3">📦</p>
            <p className="lz-heading text-sm text-gray-900 dark:text-white">{cat}</p>
            <p className="text-xs text-gray-400">{products.filter(p => p.category === cat).length} produits</p>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Page compte ─────────────────────────────────────────────────────────────
  const AccountPage = () => (
    <div className="pb-24 px-4 py-6 space-y-5">
      <h2 className="lz-heading text-xl text-gray-900 dark:text-white">Mon compte</h2>
      <div className="space-y-3">
        {[
          { icon: ShoppingCart, label: "Mon panier", sub: `${totalItems} article(s)`, action: () => setShowCart(true) },
          { icon: Heart, label: "Mes favoris", sub: `${favorites.size} produit(s)`, action: () => {} },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <item.icon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </button>
        ))}
        {(store.address || store.phone || store.email) && (
          <div className="p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            <p className="lz-heading text-sm text-gray-900 dark:text-white mb-2">📍 Infos boutique</p>
            {store.address && (
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color }} />
                {store.address}
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color }} />
                {store.phone}
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color }} />
                {store.email}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ─── Panier (drawer) ─────────────────────────────────────────────────────────
  const CartDrawer = () => (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
      <div className="w-full max-w-sm bg-white dark:bg-gray-950 flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="lz-heading text-lg text-gray-900 dark:text-white">
            Panier ({totalItems})
          </h2>
          <button onClick={() => setShowCart(false)} className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <ShoppingCart className="h-16 w-16 text-gray-200" />
            <p className="text-gray-400 text-sm">Votre panier est vide</p>
            <button onClick={() => { setShowCart(false); setActivePage("shop"); }}
              className="lz-btn-cta px-6 py-3 text-sm text-white font-semibold rounded-full" style={{ background: color }}>
              Explorer la boutique
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl">{item.icon_emoji}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color }}>
                      {item.price.toLocaleString("fr-FR")} FCFA
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-current transition-colors"
                        style={{ color }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-current transition-colors"
                        style={{ color }}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString("fr-FR")} F
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                  {deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toLocaleString("fr-FR")} FCFA`}
                </span>
              </div>
              {store.free_delivery_minimum > 0 && deliveryFee > 0 && (
                <p className="text-[11px] text-gray-400">
                  Livraison gratuite dès {store.free_delivery_minimum.toLocaleString("fr-FR")} FCFA
                </p>
              )}
              <div className="flex justify-between lz-heading text-base text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-3">
                <span>Total</span>
                <span style={{ color }}>{cartTotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <button
                onClick={() => { setShowCart(false); setShowCheckout(true); }}
                className="lz-btn-cta w-full py-4 text-sm font-semibold text-white rounded-full flex items-center justify-center gap-2"
                style={{ background: color }}
              >
                Commander maintenant <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ─── Checkout modal ──────────────────────────────────────────────────────────
  const CheckoutModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-950 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-950 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 z-10">
          <h2 className="lz-heading text-lg text-gray-900 dark:text-white">Finaliser la commande</h2>
          <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Nom complet *", key: "name", placeholder: "Jean Dupont", type: "text" },
            { label: "Téléphone *", key: "phone", placeholder: "+225 07 XX XX XX XX", type: "tel" },
            { label: "Email", key: "email", placeholder: "exemple@mail.com", type: "email" },
            { label: "Adresse de livraison", key: "address", placeholder: "Quartier, Ville", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(orderForm as any)[f.key]}
                onChange={e => setOrderForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 rounded-none"
                style={{ ["--tw-ring-color" as any]: color + "60" }}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mode de paiement</label>
            <select
              value={orderForm.payment_method}
              onChange={e => setOrderForm(prev => ({ ...prev, payment_method: e.target.value }))}
              className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none"
            >
              <option value="cash_on_delivery">💵 Paiement à la livraison</option>
              <option value="mobile_money">📱 Mobile Money</option>
              <option value="bank_transfer">🏦 Virement bancaire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              placeholder="Instructions spéciales, heure de livraison…"
              value={orderForm.notes}
              onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none resize-none"
            />
          </div>
          {/* Récap */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Récapitulatif</p>
            {cart.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{i.name} ×{i.quantity}</span>
                <span className="font-medium">{(i.price * i.quantity).toLocaleString("fr-FR")} F</span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold" style={{ color }}>
              <span>Total</span>
              <span>{cartTotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
          <button
            onClick={submitOrder}
            disabled={submitting || !orderForm.name || !orderForm.phone}
            className="lz-btn-cta w-full py-4 text-sm font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: color }}
          >
            {submitting ? (
              <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement…</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Confirmer la commande</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Commande confirmée ──────────────────────────────────────────────────────
  if (orderSuccess) return (
    <div className={`lz-root ${darkMode ? "dark" : ""} flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 p-6`}>
      <style>{ZONE_STYLES}</style>
      <div className="text-center space-y-5 max-w-sm">
        <div className="text-7xl animate-bounce">✅</div>
        <h1 className="lz-heading text-3xl text-gray-900 dark:text-white">Commande confirmée !</h1>
        <p className="text-gray-500">Numéro de commande :</p>
        <p className="font-mono font-bold text-lg" style={{ color }}>{orderSuccess}</p>
        <p className="text-sm text-gray-400">Vous serez contacté(e) prochainement pour la livraison.</p>
        {store.whatsapp && (
          <a
            href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=Bonjour, j'ai passé la commande ${orderSuccess}`}
            target="_blank" rel="noopener noreferrer"
            className="lz-btn-cta inline-flex items-center gap-2 px-6 py-3 text-sm text-white rounded-full font-semibold"
            style={{ background: "#25d366" }}
          >
            <MessageCircle className="h-4 w-4" /> Contacter le vendeur
          </a>
        )}
        <button
          onClick={() => { setOrderSuccess(null); setOrderForm({ name: "", phone: "+225 ", email: "", address: "", notes: "", payment_method: "cash_on_delivery" }); }}
          className="block w-full text-sm text-gray-400 hover:text-gray-600 underline mt-2"
        >Retour à la boutique</button>
      </div>
    </div>
  );

  // ─── Navigation items ────────────────────────────────────────────────────────
  const navItems: { page: StorePage; icon: typeof Home; label: string }[] = [
    { page: "home",       icon: Home,    label: "Accueil" },
    { page: "shop",       icon: Store,   label: "Boutique" },
    { page: "categories", icon: Grid2X2, label: "Catégories" },
    { page: "search",     icon: Search,  label: "Recherche" },
    { page: "account",    icon: User,    label: "Compte" },
  ];

  // ─── RENDER PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className={`lz-root ${darkMode ? "dark" : ""} min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white`}>
      <style>{ZONE_STYLES}</style>

      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <button onClick={() => setActivePage("home")} className="flex items-center gap-2">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-9 w-9 object-cover" />
            ) : (
              <div className="h-9 w-9 flex items-center justify-center text-white font-bold text-sm font-mono" style={{ background: color }}>
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="lz-heading text-base hidden sm:block">{store.name}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="h-9 w-9 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setActivePage("search")}
              className="h-9 w-9 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
            {store.allow_orders && (
              <button
                onClick={() => setShowCart(true)}
                className="relative h-9 w-9 flex items-center justify-center text-gray-600 dark:text-gray-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ background: color }}>
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Pages */}
      {activePage === "home"       && <HomePage />}
      {activePage === "shop"       && <ShopPage />}
      {activePage === "categories" && <CategoriesPage />}
      {activePage === "search"     && <SearchPage />}
      {activePage === "account"    && <AccountPage />}

      {/* WhatsApp flottant */}
      {store.whatsapp && (
        <a
          href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-30 h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          title="Contacter via WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      {/* Bottom navigation */}
      <nav className="lz-nav fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const active = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { setActivePage(item.page); if (item.page !== "search") setSearch(""); }}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
              >
                <item.icon
                  className="h-5 w-5"
                  style={active ? { color } : { color: "#9ca3af" }}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium" style={active ? { color } : { color: "#9ca3af" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer (visible sur desktop seulement) */}
      <footer className="hidden md:block bg-gray-900 text-white mt-20">
        <div className="bg-gray-800 py-10 px-4">
          <div className="max-w-md mx-auto text-center">
            <h3 className="lz-heading text-lg mb-2">Restez informé</h3>
            <p className="text-sm text-gray-400 mb-5">Recevez les offres exclusives de {store.name}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre e-mail"
                className="flex-1 h-12 px-4 bg-gray-700 text-white border-0 text-sm placeholder-gray-400 focus:outline-none"
              />
              <button
                className="lz-btn-cta h-12 px-6 text-white font-semibold flex items-center"
                style={{ background: color }}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            <div>
              <h4 className="lz-heading text-sm mb-4">{store.name}</h4>
              <nav className="space-y-2">
                {[
                  { label: "Boutique", action: () => setActivePage("shop") },
                  { label: "Catégories", action: () => setActivePage("categories") },
                  { label: "Mon compte", action: () => setActivePage("account") },
                ].map(l => (
                  <button key={l.label} onClick={l.action} className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </button>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="lz-heading text-sm mb-4">Contact</h4>
              <div className="space-y-2">
                {store.phone  && <p className="text-sm text-gray-400">{store.phone}</p>}
                {store.email  && <p className="text-sm text-gray-400">{store.email}</p>}
                {store.address && <p className="text-sm text-gray-400">{store.address}</p>}
                {store.whatsapp && (
                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    WhatsApp disponible
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="lz-heading text-sm mb-4">Livraison</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Frais : {store.delivery_fee > 0 ? `${store.delivery_fee.toLocaleString("fr-FR")} FCFA` : "Gratuit"}</p>
                {store.free_delivery_minimum > 0 && (
                  <p>Gratuit dès {store.free_delivery_minimum.toLocaleString("fr-FR")} FCFA</p>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} {store.name}. Tous droits réservés.</p>
            <p className="text-sm text-gray-500">{FOOTER_TEXT}</p>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {showCart     && <CartDrawer />}
      {showCheckout && <CheckoutModal />}
    </div>
  );
}
