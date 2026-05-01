/**
 * ============================================================
 * PublicStore.tsx — Boutique publique Stocknix
 * Refonte "La Zone" : header desktop, hover produits, page détail
 * ============================================================
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import {
  Search, ShoppingCart, Heart, X, Plus, Minus, Star,
  Eye, MessageCircle, Moon, Sun, ChevronRight, ChevronLeft,
  ArrowRight, Truck, Shield, CheckCircle, CreditCard, Package,
  Phone, Mail, MapPin, SlidersHorizontal, ChevronDown,
  User, Settings, LogOut, Bell, Bookmark,
} from "lucide-react";

// ─── PARAMÈTRES ──────────────────────────────────────────────────────────────
const FONT_HEADING_URL =
  "https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap";

const HERO_TAGLINE = "Découvrez nos meilleurs produits, livrés chez vous";

const BENEFITS = [
  { icon: Truck,        text: "Livraison rapide" },
  { icon: CheckCircle, text: "Qualité garantie" },
  { icon: Shield,      text: "Satisfait ou remboursé" },
  { icon: CreditCard,  text: "Paiement à la livraison" },
];

const FOOTER_TEXT = "Propulsé par Stocknix";

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
  extra_images?: string[];
  compare_at_price?: number | null;
}
interface CartItem {
  id: string; name: string; price: number; quantity: number;
  icon_emoji: string; image_url: string | null;
}
type StorePage = "home" | "shop" | "categories" | "search" | "account" | "product";
type SortOption = "recent" | "price_asc" | "price_desc" | "name";

// ── CSS ──────────────────────────────────────────────────────────────────────
const ZONE_STYLES = `
@import url('${FONT_HEADING_URL}');

.lz-root { font-family: 'Inter', system-ui, sans-serif; }
.lz-heading { font-family: 'Satoshi', 'Inter', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

.lz-btn-cta {
  position: relative; overflow: hidden;
  font-weight: 600; transition: all .25s;
}
.lz-btn-cta:hover { transform: translateY(-1px); filter: brightness(1.05); }

.lz-promo-shine { animation: lz-promo 4s linear infinite; }
@keyframes lz-promo { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }

.lz-fade { opacity: 0; transform: translateY(20px); transition: opacity .6s, transform .6s; }
.lz-fade.visible { opacity: 1; transform: none; }

@keyframes lz-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lz-hero-title { animation: lz-slide-up .8s .3s both; }
.lz-hero-sub   { animation: lz-slide-up .8s .5s both; }
.lz-hero-btn   { animation: lz-slide-up .8s .65s both; }

.lz-scroll::-webkit-scrollbar { display: none; }
.lz-scroll { -ms-overflow-style: none; scrollbar-width: none; }

.lz-nav { padding-bottom: max(env(safe-area-inset-bottom), 4px); }

/* Product card hover — La Zone style */
.lz-pcard { position: relative; overflow: hidden; }
.lz-pcard-img-wrap { position: relative; overflow: hidden; }
.lz-pcard-img { transition: opacity .4s ease; }
.lz-pcard-img-secondary {
  position: absolute; inset: 0;
  opacity: 0; transition: opacity .4s ease;
}
.lz-pcard:hover .lz-pcard-img-secondary { opacity: 1; }

.lz-pcard-actions {
  position: absolute; top: 12px; right: 12px;
  display: flex; flex-direction: column; gap: 8px;
  opacity: 0; transform: translateX(8px);
  transition: opacity .3s, transform .3s;
}
.lz-pcard:hover .lz-pcard-actions { opacity: 1; transform: translateX(0); }

.lz-pcard-arrows {
  position: absolute; inset-block: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 8px;
  opacity: 0; transition: opacity .3s;
  pointer-events: none;
}
.lz-pcard:hover .lz-pcard-arrows { opacity: 1; }
.lz-pcard-arrows > button { pointer-events: auto; }

@media (hover: none) {
  .lz-pcard-actions { opacity: 1; transform: none; }
  .lz-pcard-arrows { opacity: 0; }
}

/* Page transitions */
@keyframes lz-slide-in-right {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes lz-fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lz-page-categories { animation: lz-slide-in-right .45s ease-out both; }
.lz-page-search     { animation: lz-fade-in-down .35s ease-out both; }
.lz-page-default    { animation: lz-slide-up .4s ease-out both; }

/* Horizontal scroll snap */
.lz-hscroll {
  display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; padding-bottom: 8px;
  scrollbar-width: none;
}
.lz-hscroll::-webkit-scrollbar { display: none; }
.lz-hscroll-item { flex: 0 0 65%; max-width: 280px; scroll-snap-align: start; }
@media (min-width: 640px) { .lz-hscroll-item { flex: 0 0 240px; } }
@media (min-width: 1024px) { .lz-hscroll-item { flex: 0 0 260px; } }

/* Sticky bottom CTAs (product detail) */
.lz-sticky-cta {
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  border-top: 1px solid rgba(0,0,0,0.06);
  padding: 12px 16px;
  padding-bottom: max(env(safe-area-inset-bottom), 12px);
}
.dark .lz-sticky-cta { background: rgba(10,10,15,0.96); border-top-color: rgba(255,255,255,0.08); }

/* Order loading overlay */
.lz-order-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  animation: lz-fade-in-down .25s ease-out both;
}
`;

// ─── Hook fade-in ────────────────────────────────────────────────────────────
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

// ─── Format prix ─────────────────────────────────────────────────────────────
const fmt = (n: number) => `${n.toLocaleString("fr-FR")} CFA`;

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [store, setStore]           = useState<StoreData | null>(null);
  const [products, setProducts]     = useState<ProductData[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [dbCategoryImages, setDbCategoryImages] = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);

  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePage, setActivePage]         = useState<StorePage>("home");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [darkMode, setDarkMode]             = useState(false);
  const [sortBy, setSortBy]                 = useState<SortOption>("recent");
  const [showSort, setShowSort]             = useState(false);
  const [pageAnimKey, setPageAnimKey]       = useState(0);

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

  useEffect(() => { localStorage.setItem(`cart-${slug}`, JSON.stringify(cart)); }, [cart, slug]);
  useEffect(() => { localStorage.setItem(`favs-${slug}`, JSON.stringify([...favorites])); }, [favorites, slug]);

  // Force animation re-trigger on page change & scroll to top
  useEffect(() => {
    setPageAnimKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePage, activeProductId]);

  // Load store + ALL products + images
  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: storeData } = await supabase
        .from("online_store").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData as StoreData);

      const { data: sp } = await supabase
        .from("store_products").select("*, products(*)")
        .eq("store_id", storeData.id).order("is_featured", { ascending: false });
      const mapped: ProductData[] = (sp || []).map((s: any) => ({
        id: s.products.id, name: s.products.name,
        price: s.online_price ?? s.products.price,
        quantity: s.products.quantity,
        icon_emoji: s.products.icon_emoji || "📦",
        icon_bg_color: s.products.icon_bg_color || "bg-blue",
        category: s.products.category, description: s.products.description,
        online_price: s.online_price, is_featured: s.is_featured,
        image_url: s.products.image_url || null,
        compare_at_price: s.products.price !== (s.online_price ?? s.products.price) && s.online_price ? s.products.price : null,
      }));
      setProducts(mapped);

      // Load extra images for all products in one shot
      const ids = mapped.map(p => p.id);
      if (ids.length > 0) {
        const { data: imgs } = await supabase
          .from("product_images")
          .select("product_id, image_url, sort_order")
          .in("product_id", ids)
          .order("sort_order", { ascending: true });
        const grouped: Record<string, string[]> = {};
        (imgs || []).forEach((row: any) => {
          if (!grouped[row.product_id]) grouped[row.product_id] = [];
          grouped[row.product_id].push(row.image_url);
        });
        setProductImages(grouped);
      }

      // Load category images uploaded by the owner
      const { data: cats } = await supabase
        .from("product_categories")
        .select("name, image_url")
        .eq("user_id", storeData.user_id);
      const catMap: Record<string, string> = {};
      (cats || []).forEach((c: any) => { if (c.image_url) catMap[c.name] = c.image_url; });
      setDbCategoryImages(catMap);

      setLoading(false);
    };
    load();
  }, [slug]);

  // Get all images for a product (main + extras, deduplicated)
  const getProductImages = (p: ProductData): string[] => {
    const extras = productImages[p.id] || [];
    const all = p.image_url ? [p.image_url, ...extras] : extras;
    return [...new Set(all)];
  };

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))] as string[],
    [products]
  );

  // Category cover : priorité à l'image uploadée par le propriétaire (StoreConfig),
  // sinon fallback sur la première image produit de cette catégorie.
  const categoryImages = useMemo(() => {
    const map: Record<string, string> = { ...dbCategoryImages };
    for (const p of products) {
      if (p.category && !map[p.category] && p.image_url) {
        map[p.category] = p.image_url;
      }
    }
    return map;
  }, [products, dbCategoryImages]);

  const featured = useMemo(() => products.filter(p => p.is_featured).slice(0, 4), [products]);

  const filtered = useMemo(() => {
    let f = products;
    if (activeCategory) f = f.filter(p => p.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q));
    }
    const sorted = [...f];
    switch (sortBy) {
      case "price_asc":  sorted.sort((a, b) => a.price - b.price); break;
      case "price_desc": sorted.sort((a, b) => b.price - a.price); break;
      case "name":       sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return sorted;
  }, [products, activeCategory, search, sortBy]);

  const activeProduct = useMemo(
    () => products.find(p => p.id === activeProductId) || null,
    [products, activeProductId]
  );

  // Cart helpers
  const addToCart = (p: ProductData, qty = 1) => {
    if (p.quantity <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, quantity: qty, icon_emoji: p.icon_emoji, image_url: p.image_url }];
    });
  };
  const updateQty = (id: string, d: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0));
  const toggleFav = (id: string) =>
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const subtotal    = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = store?.free_delivery_minimum && subtotal >= store.free_delivery_minimum
    ? 0 : (store?.delivery_fee || 0);
  const cartTotal   = subtotal + deliveryFee;
  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);

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

  const goToProduct = (id: string) => {
    setActiveProductId(id);
    setActivePage("product");
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

  // ─── Image fallback ──────────────────────────────────────────────────────────
  const ImageOrIcon = ({ src, product, className = "" }: { src?: string | null; product?: ProductData; className?: string }) => {
    if (src) return <img src={src} alt={product?.name || ""} className={`${className} object-cover w-full h-full`} loading="lazy" />;
    if (product) return (
      <div className={`${className} w-full h-full flex items-center justify-center`} style={getIconBgStyle(product.icon_bg_color)}>
        <span className="text-5xl">{product.icon_emoji}</span>
      </div>
    );
    return <div className={`${className} w-full h-full bg-gray-100`} />;
  };

  // ─── CARTE PRODUIT (style Capture 2) ────────────────────────────────────────
  const ProductCard = ({ product }: { product: ProductData }) => {
    const imgs = getProductImages(product);
    const [imgIdx, setImgIdx] = useState(0);
    const hasMultiple = imgs.length > 1;
    const discount = product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;
    const isFav = favorites.has(product.id);

    return (
      <div className="lz-pcard group">
        {/* Image avec aspect carré */}
        <div className="lz-pcard-img-wrap aspect-square bg-gray-50 dark:bg-gray-900 mb-3 cursor-pointer" onClick={() => goToProduct(product.id)}>
          {imgs.length > 0 ? (
            <>
              <img
                src={imgs[imgIdx]}
                alt={product.name}
                className="lz-pcard-img w-full h-full object-cover"
                loading="lazy"
              />
              {hasMultiple && (
                <img
                  src={imgs[(imgIdx + 1) % imgs.length]}
                  alt=""
                  className="lz-pcard-img-secondary w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <ImageOrIcon product={product} />
          )}

          {/* Badge discount */}
          {discount && (
            <div className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-bold text-white bg-red-500">
              -{discount}%
            </div>
          )}
          {!discount && product.is_featured && (
            <div className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold text-white" style={{ background: color }}>
              VEDETTE
            </div>
          )}

          {/* Actions hover (favori + œil) */}
          <div className="lz-pcard-actions z-10">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
              className="h-9 w-9 bg-white dark:bg-gray-800 shadow flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Favori"
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToProduct(product.id); }}
              className="h-9 w-9 bg-white dark:bg-gray-800 shadow flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Vue rapide"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Flèches gauche/droite */}
          {hasMultiple && (
            <div className="lz-pcard-arrows z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length); }}
                className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center hover:bg-white"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length); }}
                className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center hover:bg-white"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Infos sous l'image */}
        <div className="px-1 cursor-pointer" onClick={() => goToProduct(product.id)}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1 transition-colors group-hover:text-current"
              style={{ color: undefined }}>
            <span className="group-hover:opacity-0 transition-opacity duration-200 inline-block w-full" style={{ color: 'inherit' }}>
              {product.name}
            </span>
          </h3>
          <h3 className="text-sm font-medium mb-1 line-clamp-1 -mt-[22px] transition-opacity opacity-0 group-hover:opacity-100"
              style={{ color }}>
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white">{fmt(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-gray-400 line-through">{fmt(product.compare_at_price)}</span>
            )}
          </div>
        </div>

        {/* Bouton Commander — visible sur la carte */}
        {store.allow_orders && product.quantity > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
              localStorage.setItem(
                `cart-${slug}`,
                JSON.stringify(
                  cart.find(i => i.id === product.id)
                    ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                    : [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, icon_emoji: product.icon_emoji, image_url: product.image_url }]
                )
              );
              navigate(`/boutique/${slug}/checkout`);
            }}
            className="lz-btn-cta mt-2 w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white rounded-full flex items-center justify-center gap-1.5"
            style={{ background: color }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Commander
          </button>
        )}
      </div>
    );
  };

  // ─── PromoBar ────────────────────────────────────────────────────────────────
  const PromoBar = () => (
    <section className="relative overflow-hidden py-3 text-white" style={{ background: color }}>
      <div className="lz-promo-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 text-center relative z-10">
        <p className="lz-heading text-xs md:text-sm font-bold uppercase tracking-wider">
          🎉 Boutique officielle de {store.name} — Commandez en toute confiance
        </p>
      </div>
    </section>
  );

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

  // ─── HOME PAGE ───────────────────────────────────────────────────────────────
  const HomePage = () => {
    const featRef  = useFadeIn();
    const catRef   = useFadeIn();
    const statsRef = useFadeIn();
    return (
      <div className="pb-24">
        {/* Hero */}
        <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
          {store.banner_url ? (
            <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}33 0%, #111827 100%)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <p className="lz-hero-sub text-xs uppercase tracking-[0.3em] text-white/60 mb-4">Boutique en ligne</p>
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
        </section>

        <PromoBar />
        <BenefitsSection />

        {/* Vedettes */}
        {featured.length > 0 && (
          <section ref={featRef} className="lz-fade container mx-auto px-4 py-12">
            <div className="text-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Sélection</span>
              <h2 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white mt-1">Produits vedettes</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={() => setActivePage("shop")}
                className="inline-flex items-center gap-2 text-sm font-semibold border border-current px-6 py-3 hover:opacity-70 transition-opacity"
                style={{ color }}
              >
                Voir tous les produits <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* CATÉGORIES — style Capture 3 */}
        {categories.length > 0 && (
          <section className="bg-gray-50 dark:bg-gray-900 py-12">
            <div ref={catRef} className="lz-fade container mx-auto px-4">
              <div className="text-center mb-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Nos collections</span>
                <h2 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white mt-1">Explorez nos univers</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {categories.slice(0, 8).map(cat => {
                  const img = categoryImages[cat];
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setActivePage("shop"); }}
                      className="relative group aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-2xl"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={cat}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${color}55, ${color}22)` }}>📦</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left text-white">
                        <h3 className="lz-heading text-sm md:text-base leading-tight">{cat}</h3>
                        <p className="text-[10px] md:text-xs opacity-80 mt-0.5">{count} produit{count > 1 ? "s" : ""}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section ref={statsRef} className="lz-fade container mx-auto px-4 py-12 text-center">
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
        </section>

        {/* Tous nos produits preview */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="lz-heading text-xl md:text-2xl text-gray-900 dark:text-white">Tous nos produits</h2>
            <button onClick={() => setActivePage("shop")} className="text-sm font-semibold flex items-center gap-1" style={{ color }}>
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    );
  };

  // ─── SHOP PAGE — style Capture 2 ─────────────────────────────────────────────
  const ShopPage = () => (
    <div className="pb-24">
      {/* Barre filtre + tri */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900">
            <span>Filtre</span>
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <div className="relative">
            <button onClick={() => setShowSort(s => !s)} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900">
              {sortBy === "recent" ? "Plus récent" : sortBy === "price_asc" ? "Prix croissant" : sortBy === "price_desc" ? "Prix décroissant" : "Nom A-Z"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg z-30 w-44">
                {[
                  { v: "recent", l: "Plus récent" },
                  { v: "price_asc", l: "Prix croissant" },
                  { v: "price_desc", l: "Prix décroissant" },
                  { v: "name", l: "Nom A-Z" },
                ].map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => { setSortBy(opt.v as SortOption); setShowSort(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filtres catégories scrollables */}
        <div className="lz-scroll flex gap-2 px-4 pb-4 overflow-x-auto container mx-auto">
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
      </div>

      <div className="container mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-8">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );

  // ─── PRODUCT DETAIL PAGE — style Capture 4-5 ────────────────────────────────
  const ProductDetailPage = () => {
    const p = activeProduct;
    const [imgIdx, setImgIdx] = useState(0);
    const [tab, setTab] = useState<"description" | "reviews">("description");
    const [qty, setQty] = useState(1);
    const [size, setSize] = useState<string | null>(null);
    const [colorChoice, setColorChoice] = useState<string | null>(null);

    if (!p) return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Produit introuvable</p>
        <button onClick={() => setActivePage("shop")} className="mt-4 text-sm" style={{ color }}>← Retour</button>
      </div>
    );

    const imgs = getProductImages(p);
    const isFav = favorites.has(p.id);
    const similar = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

    const handleBuyNow = () => {
      addToCart(p, qty);
      // Sauvegarder immédiatement le panier mis à jour avant la navigation
      const updatedCart = (() => {
        const ex = cart.find(i => i.id === p.id);
        if (ex) return cart.map(i => i.id === p.id ? { ...i, quantity: i.quantity + qty } : i);
        return [...cart, { id: p.id, name: p.name, price: p.price, quantity: qty, icon_emoji: p.icon_emoji, image_url: p.image_url }];
      })();
      localStorage.setItem(`cart-${slug}`, JSON.stringify(updatedCart));
      navigate(`/boutique/${slug}/checkout`);
    };

    return (
      <div className="pb-44 lg:pb-24">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galerie */}
            <div>
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 mb-4 border border-gray-100 dark:border-gray-800">
                {imgs.length > 0 ? (
                  <img src={imgs[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageOrIcon product={p} />
                )}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white shadow flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setImgIdx((imgIdx + 1) % imgs.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white shadow flex items-center justify-center"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>
              {imgs.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {imgs.slice(0, 5).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`aspect-square overflow-hidden border-2 transition-colors ${imgIdx === i ? "border-current" : "border-transparent"}`}
                      style={{ color: imgIdx === i ? color : undefined }}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white">{p.name}</h1>
                <button
                  onClick={() => toggleFav(p.id)}
                  className="h-11 w-11 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-gray-400 transition-colors flex-shrink-0"
                  aria-label="Favori"
                >
                  <Heart className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-sm text-gray-500">(19 avis)</span>
              </div>

              <p className="text-3xl font-bold mb-6" style={{ color }}>{fmt(p.price)}</p>

              {/* Bénéfices */}
              <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                {BENEFITS.map(b => (
                  <div key={b.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <b.icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Quantité */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-300">Quantité</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-700">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(p.quantity, qty + 1))} className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Boutons (visibles inline desktop, sticky bottom mobile/tablet) */}
              {p.quantity === 0 ? (
                <p className="text-red-500 font-semibold text-center py-4">Rupture de stock</p>
              ) : store.allow_orders ? (
                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(p, qty)}
                    className="py-4 px-6 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-2 rounded-full"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter au panier
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="lz-btn-cta py-4 px-6 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2"
                    style={{ background: color }}
                  >
                    Acheter maintenant
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {store.show_stock && p.quantity > 0 && (
                <p className="text-xs text-gray-400 text-center mt-3">{p.quantity} en stock</p>
              )}
            </div>
          </div>

          {/* Onglets Description / Avis */}
          <div className="mt-12 lg:mt-16 max-w-3xl">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setTab("description")}
                className="px-6 py-3 text-sm font-semibold border-b-2 transition-colors"
                style={{
                  borderColor: tab === "description" ? color : "transparent",
                  color: tab === "description" ? color : "#6b7280",
                }}
              >
                Description
              </button>
              <button
                onClick={() => setTab("reviews")}
                className="px-6 py-3 text-sm font-semibold border-b-2 transition-colors"
                style={{
                  borderColor: tab === "reviews" ? color : "transparent",
                  color: tab === "reviews" ? color : "#6b7280",
                }}
              >
                Avis (19)
              </button>
            </div>

            {tab === "description" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="lz-heading text-base text-gray-900 dark:text-white mb-3">À propos de ce produit</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {p.description || `${p.name} — Produit de qualité premium, idéal pour un usage quotidien.`}
                  </p>
                </div>
                <div>
                  <h3 className="lz-heading text-base text-gray-900 dark:text-white mb-3">Caractéristiques</h3>
                  <ul className="space-y-2">
                    {["Matériaux de haute qualité", "Design moderne et élégant", "Garantie satisfaction"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <span className="text-sm font-semibold">Client satisfait</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Excellent produit, je recommande vivement !</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vous pourriez aussi aimer — carrousel horizontal */}
          {similar.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <h3 className="lz-heading text-xl text-gray-900 dark:text-white mb-6">Vous pourriez aussi aimer</h3>
              <div className="lz-hscroll -mx-4 px-4 md:mx-0 md:px-0">
                {similar.map(s => (
                  <div key={s.id} className="lz-hscroll-item">
                    <ProductCard product={s} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STICKY BOTTOM CTA — mobile & tablet uniquement */}
        {p.quantity > 0 && store.allow_orders && (
          <div className="lz-sticky-cta lg:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-950/95 backdrop-blur px-4 py-3">
            <div className="container mx-auto flex items-center gap-2">
              <button
                onClick={() => addToCart(p, qty)}
                className="flex-1 py-3 px-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs sm:text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors flex items-center justify-center gap-1.5 rounded-full"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter au panier</span>
                <span className="sm:hidden">Panier</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="lz-btn-cta flex-1 py-3 px-3 text-white text-xs sm:text-sm font-semibold rounded-full flex items-center justify-center gap-1.5"
                style={{ background: color }}
              >
                <span>Acheter maintenant</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── SEARCH PAGE ─────────────────────────────────────────────────────────────
  const SearchPage = () => (
    <div className="pb-24 px-4 py-4 container mx-auto">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

  // ─── CATEGORIES PAGE — mosaïque asymétrique (1 grande + 2x2) ────────────────
  const CategoriesPage = () => {
    const [first, ...rest] = categories;
    const renderCard = (cat: string, big = false) => {
      const img = categoryImages[cat];
      const count = products.filter(p => p.category === cat).length;
      return (
        <button
          key={cat}
          onClick={() => { setActiveCategory(cat); setActivePage("shop"); }}
          className={`group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-square`}
        >
          {img ? (
            <img
              src={img}
              alt={cat}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-6xl"
              style={{ background: `linear-gradient(135deg, ${color}55, ${color}22)` }}
            >
              📦
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-0 left-0 right-0 p-4 md:p-5 flex items-start justify-between text-white">
            <span className={`lz-heading uppercase tracking-wide ${big ? 'text-base md:text-xl' : 'text-sm md:text-base'}`}>
              {cat}
            </span>
            <span className="text-[10px] md:text-xs bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
              {count} produit{count > 1 ? 's' : ''}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
            <span className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Découvrir <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>
      );
    };

    return (
      <div className="pb-24 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Nos collections</span>
          <h2 className="lz-heading text-2xl md:text-3xl text-gray-900 dark:text-white mt-1">
            Toutes les collections
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune catégorie disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map(cat => renderCard(cat))}
          </div>
        )}
      </div>
    );
  };

  // ─── ACCOUNT PAGE — design minimaliste type iOS ──────────────────────────────
  const AccountPage = () => {
    const favProducts = products.filter(p => favorites.has(p.id));
    return (
      <div className="pb-28 px-4 py-6 container mx-auto max-w-2xl space-y-6">
        {/* En-tête profil */}
        <div className="flex flex-col items-center text-center pt-4 pb-6">
          <div className="h-20 w-20 rounded-full flex items-center justify-center text-white shadow-lg mb-3" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}>
            <User className="h-10 w-10" />
          </div>
          <h2 className="lz-heading text-xl text-gray-900 dark:text-white">Mon compte</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gérez vos favoris et votre boutique</p>
        </div>

        {/* Stats compactes */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowCart(true)} className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-900 text-left active:scale-95 transition-transform">
            <ShoppingCart className="h-5 w-5 mb-2" style={{ color }} />
            <p className="text-2xl lz-heading text-gray-900 dark:text-white">{totalItems}</p>
            <p className="text-xs text-gray-500">Articles panier</p>
          </button>
          <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-900">
            <Heart className="h-5 w-5 mb-2 fill-red-500 text-red-500" />
            <p className="text-2xl lz-heading text-gray-900 dark:text-white">{favorites.size}</p>
            <p className="text-xs text-gray-500">Favoris</p>
          </div>
        </div>

        {/* Mes favoris */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="lz-heading text-sm uppercase tracking-wider text-gray-500">Mes favoris</h3>
            {favProducts.length > 4 && (
              <button onClick={() => setActivePage("shop")} className="text-xs font-medium" style={{ color }}>Tout voir</button>
            )}
          </div>
          {favProducts.length === 0 ? (
            <div className="rounded-2xl p-8 bg-gray-50 dark:bg-gray-900 text-center">
              <Heart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Aucun favori pour le moment</p>
              <button onClick={() => setActivePage("shop")} className="mt-3 text-xs font-semibold" style={{ color }}>
                Découvrir des produits →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favProducts.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => goToProduct(p.id)}
                  className="rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 text-left active:scale-95 transition-transform"
                >
                  <div className="aspect-square bg-white dark:bg-gray-800 relative">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      : <div className="absolute inset-0 flex items-center justify-center text-4xl">{p.icon_emoji}</div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color }}>{(p.online_price ?? p.price).toLocaleString('fr-FR')} F</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos boutique compact */}
        {(store.address || store.phone || store.email) && (
          <div>
            <h3 className="lz-heading text-sm uppercase tracking-wider text-gray-500 mb-3 px-1">Contact boutique</h3>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-3 p-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${color}15`, color }}><Phone className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{store.phone}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </a>
              )}
              {store.email && (
                <a href={`mailto:${store.email}`} className="flex items-center gap-3 p-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${color}15`, color }}><Mail className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{store.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </a>
              )}
              {store.address && (
                <div className="flex items-start gap-3 p-4">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}><MapPin className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{store.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode sombre */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 active:scale-[0.98] transition-transform"
        >
          <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${color}15`, color }}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Mode {darkMode ? 'clair' : 'sombre'}</p>
            <p className="text-xs text-gray-500">Basculer le thème</p>
          </div>
        </button>
      </div>
    );
  };

  // ─── CART DRAWER ─────────────────────────────────────────────────────────────
  const CartDrawer = () => (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
      <div className="w-full max-w-sm bg-white dark:bg-gray-950 flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="lz-heading text-lg text-gray-900 dark:text-white">Panier ({totalItems})</h2>
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
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-2xl">{item.icon_emoji}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color }}>{fmt(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, -1)} className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-current" style={{ color }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-current" style={{ color }}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-500"><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                  {deliveryFee === 0 ? "Gratuite" : fmt(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between lz-heading text-base text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-3">
                <span>Total</span><span style={{ color }}>{fmt(cartTotal)}</span>
              </div>
              <button
                onClick={() => { setShowCart(false); navigate(`/boutique/${slug}/checkout`); }}
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

  // ─── CHECKOUT ────────────────────────────────────────────────────────────────
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
              placeholder="Instructions spéciales…"
              value={orderForm.notes}
              onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none resize-none"
            />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Récapitulatif</p>
            {cart.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{i.name} ×{i.quantity}</span>
                <span className="font-medium">{fmt(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold" style={{ color }}>
              <span>Total</span><span>{fmt(cartTotal)}</span>
            </div>
          </div>
          <button
            onClick={submitOrder}
            disabled={submitting || !orderForm.name || !orderForm.phone}
            className="lz-btn-cta w-full py-4 text-sm font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: color }}
          >
            {submitting
              ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement…</>
              : <><CheckCircle className="h-4 w-4" /> Confirmer la commande</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── ORDER SUCCESS ───────────────────────────────────────────────────────────
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
          <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=Bonjour, j'ai passé la commande ${orderSuccess}`}
             target="_blank" rel="noopener noreferrer"
             className="lz-btn-cta inline-flex items-center gap-2 px-6 py-3 text-sm text-white rounded-full font-semibold"
             style={{ background: "#25d366" }}>
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

  // ─── NAV ITEMS ───────────────────────────────────────────────────────────────
  const navItems: { page: StorePage; label: string }[] = [
    { page: "home",       label: "Accueil" },
    { page: "shop",       label: "Boutique" },
    { page: "categories", label: "Catégories" },
  ];

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className={`lz-root ${darkMode ? "dark" : ""} min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white`}>
      <style>{ZONE_STYLES}</style>

      {/* HEADER — style Capture 1 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo */}
            <button onClick={() => { setActivePage("home"); setActiveProductId(null); }} className="flex items-center gap-3 flex-shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-10 w-10 md:h-12 md:w-12 object-cover" />
              ) : (
                <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-white font-bold text-xs" style={{ background: color }}>
                  {store.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="lz-heading text-base md:text-xl uppercase tracking-wide">{store.name}</span>
            </button>

            {/* Navigation desktop centrée */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10 absolute left-1/2 -translate-x-1/2">
              {navItems.map(item => {
                const active = activePage === item.page || (activePage === "product" && item.page === "shop");
                return (
                  <button
                    key={item.page}
                    onClick={() => { setActivePage(item.page); setActiveProductId(null); }}
                    className="text-sm font-medium transition-colors relative"
                    style={{ color: active ? "#111827" : "#6b7280" }}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5" style={{ background: "#111827" }} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              {/* Bouton recherche - visible sur tablet/desktop */}
              <button
                onClick={() => setActivePage("search")}
                className="hidden sm:inline-flex h-10 w-10 border border-gray-200 dark:border-gray-700 items-center justify-center text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-full"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="h-10 w-10 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-full"
                aria-label="Mode sombre"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {store.allow_orders && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative h-10 w-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900"
                  aria-label="Panier"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ background: color }}>
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActivePage("shop")}
                className="lz-btn-cta hidden sm:inline-flex items-center px-5 md:px-7 py-2.5 md:py-3 rounded-full text-white text-sm font-semibold"
                style={{ background: color }}
              >
                Acheter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PAGES — avec animations de transition */}
      <div
        key={pageAnimKey}
        className={
          activePage === "categories" ? "lz-page-categories" :
          activePage === "search"     ? "lz-page-search" :
          "lz-page-default"
        }
      >
        {activePage === "home"       && <HomePage />}
        {activePage === "shop"       && <ShopPage />}
        {activePage === "categories" && <CategoriesPage />}
        {activePage === "search"     && <SearchPage />}
        {activePage === "account"    && <AccountPage />}
        {activePage === "product"    && <ProductDetailPage />}
      </div>

      {/* OVERLAY DE TRAITEMENT COMMANDE */}
      {submitting && (
        <div className="lz-order-overlay">
          <div className="bg-white dark:bg-gray-900 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl max-w-xs mx-4 text-center">
            <div className="h-12 w-12 border-4 border-current border-t-transparent rounded-full animate-spin" style={{ color }} />
            <p className="lz-heading text-base text-gray-900 dark:text-white">Validation en cours…</p>
            <p className="text-xs text-gray-500">Merci de patienter, nous enregistrons votre commande.</p>
          </div>
        </div>
      )}

      {/* WHATSAPP FLOTTANT */}
      {store.whatsapp && (
        <a
          href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-30 h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          title="Contacter via WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="lz-nav md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur">
        <div className="flex items-center justify-around h-16">
          {[
            { page: "home" as StorePage,       label: "Accueil",    icon: ShoppingCart },
            { page: "shop" as StorePage,       label: "Boutique",   icon: Package },
            { page: "categories" as StorePage, label: "Catégories", icon: SlidersHorizontal },
            { page: "search" as StorePage,     label: "Recherche",  icon: Search },
            { page: "account" as StorePage,    label: "Compte",     icon: Heart },
          ].map(item => {
            const active = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { setActivePage(item.page); setActiveProductId(null); if (item.page !== "search") setSearch(""); }}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
              >
                <item.icon className="h-5 w-5" style={active ? { color } : { color: "#9ca3af" }} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium" style={active ? { color } : { color: "#9ca3af" }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* DRAWERS */}
      {showCart && <CartDrawer />}

      {/* FOOTER desktop */}
      <footer className="hidden md:block bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            <div>
              <h4 className="lz-heading text-sm mb-4">{store.name}</h4>
              <nav className="space-y-2">
                {navItems.map(l => (
                  <button key={l.label} onClick={() => { setActivePage(l.page); setActiveProductId(null); }} className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </button>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="lz-heading text-sm mb-4">Contact</h4>
              <div className="space-y-2">
                {store.phone   && <p className="text-sm text-gray-400">{store.phone}</p>}
                {store.email   && <p className="text-sm text-gray-400">{store.email}</p>}
                {store.address && <p className="text-sm text-gray-400">{store.address}</p>}
                {store.whatsapp && (
                  <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:text-green-300">
                    WhatsApp disponible
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="lz-heading text-sm mb-4">Livraison</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Frais : {store.delivery_fee > 0 ? fmt(store.delivery_fee) : "Gratuit"}</p>
                {store.free_delivery_minimum > 0 && (
                  <p>Gratuit dès {fmt(store.free_delivery_minimum)}</p>
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
    </div>
  );
}
