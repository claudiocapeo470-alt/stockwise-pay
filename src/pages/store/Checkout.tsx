/**
 * ============================================================
 * Checkout.tsx — Page de finalisation de commande dédiée
 * Route : /boutique/:slug/checkout
 * Sans scroll horizontal, layout 2 colonnes desktop, 1 colonne mobile.
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, CheckCircle, ShoppingBag, Truck, Shield,
  CreditCard, MessageCircle, Loader2,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

interface CartItem {
  id: string; name: string; price: number; quantity: number;
  icon_emoji: string; image_url: string | null;
}
interface StoreData {
  id: string; name: string; slug: string;
  primary_color: string; logo_url: string | null;
  delivery_fee: number; free_delivery_minimum: number;
  whatsapp: string | null;
}

const fmt = (n: number) => `${n.toLocaleString("de-DE")} CFA`;

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [store, setStore] = useState<StoreData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "+225 ", email: "", address: "", notes: "",
    payment_method: "cash_on_delivery",
  });

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("online_store")
        .select("id, name, slug, primary_color, logo_url, delivery_fee, free_delivery_minimum, whatsapp")
        .eq("slug", slug).eq("is_published", true).maybeSingle();
      setStore(data as StoreData | null);
      try {
        setCart(JSON.parse(localStorage.getItem(`cart-${slug}`) || "[]"));
      } catch { setCart([]); }
      setLoading(false);
    };
    load();
  }, [slug]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const deliveryFee = useMemo(() => {
    if (!store) return 0;
    return store.free_delivery_minimum && subtotal >= store.free_delivery_minimum ? 0 : store.delivery_fee;
  }, [store, subtotal]);
  const total = subtotal + deliveryFee;

  const color = store?.primary_color || "#16a34a";

  const handleSubmit = async () => {
    if (!store || !form.name.trim() || !form.phone.trim() || cart.length === 0 || submitting) return;
    setSubmitting(true);
    const ids = cart.map(i => i.id);
    const { data: availability, error: availabilityError } = await supabase
      .from("store_products")
      .select("product_id, is_active, force_out_of_stock, products(quantity)")
      .eq("store_id", store.id)
      .in("product_id", ids);
    if (availabilityError) { setSubmitting(false); alert("Impossible de vérifier le stock"); return; }
    const byId = new Map((availability || []).map((row: any) => [row.product_id, row]));
    const unavailable = cart.find(item => {
      const row: any = byId.get(item.id);
      return !row || row.is_active === false || row.force_out_of_stock === true || (row.products?.quantity ?? 0) < item.quantity;
    });
    if (unavailable) {
      setSubmitting(false);
      alert(`${unavailable.name} n'est plus disponible dans cette quantité.`);
      return;
    }
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const items = cart.map(i => ({ name: i.name, icon: i.icon_emoji, price: i.price, quantity: i.quantity }));
    const { error } = await supabase.from("store_orders").insert({
      store_id: store.id, order_number: orderNumber,
      customer_name: form.name, customer_phone: form.phone,
      customer_email: form.email || null, customer_address: form.address || null,
      items, subtotal, delivery_fee: deliveryFee, total,
      payment_method: form.payment_method, notes: form.notes || null,
    });
    setSubmitting(false);
    if (error) { alert("Erreur: " + error.message); return; }
    setSuccess(orderNumber);
    localStorage.removeItem(`cart-${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Boutique introuvable</p>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 underline">Retour</button>
        </div>
      </div>
    );
  }

  // ─── ÉCRAN DE SUCCÈS ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-md text-center space-y-5">
          <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center" style={{ background: `${color}15` }}>
            <CheckCircle className="h-10 w-10" style={{ color }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Commande confirmée !</h1>
          <p className="text-sm text-gray-500">Numéro de commande</p>
          <p className="font-mono font-bold text-lg" style={{ color }}>{success}</p>
          <p className="text-sm text-gray-500">Vous serez contacté(e) prochainement pour la livraison.</p>
          <div className="flex flex-col gap-2 pt-2">
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=Bonjour, j'ai passé la commande ${success}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm text-white rounded-full font-semibold"
                style={{ background: "#25d366" }}
              >
                <MessageCircle className="h-4 w-4" /> Contacter le vendeur
              </a>
            )}
            <button
              onClick={() => navigate(`/boutique/${slug}`)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm rounded-full font-semibold border border-gray-200 hover:bg-gray-50"
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PANIER VIDE ──────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-md text-center space-y-4">
          <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto" />
          <h1 className="text-xl font-bold text-gray-700">Votre panier est vide</h1>
          <p className="text-sm text-gray-500">Retournez choisir vos produits pour passer commande.</p>
          <button
            onClick={() => navigate(`/boutique/${slug}`)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm text-white rounded-full font-semibold"
            style={{ background: color }}
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  // ─── CHECKOUT PRINCIPAL ───────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        html, body { overflow-x: hidden; max-width: 100vw; }
        .ck-input { transition: border-color .2s, box-shadow .2s; }
        .ck-input:focus { outline: none; border-color: ${color}; box-shadow: 0 0 0 3px ${color}25; }
      `}</style>

      {/* Header */}
      <header className="app-safe-header sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 min-h-14 md:min-h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/boutique/${slug}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: color }}>
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold tracking-tight truncate text-sm md:text-base">{store.name}</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      {/* Contenu — compact, sans scroll inutile */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-28">
        <h1 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900">Finaliser la commande</h1>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Formulaire */}
          <section className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nom complet *" placeholder="Jean Dupont" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone *</label>
                <PhoneInput value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v || '' }))} defaultCountry="CI" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email" type="email" placeholder="exemple@mail.com" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
              <Field label="Adresse de livraison" placeholder="Quartier, Rue, Ville" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mode de paiement</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "cash_on_delivery", icon: "💵", label: "À la livraison" },
                  { v: "mobile_money", icon: "📱", label: "Mobile Money" },
                  { v: "bank_transfer", icon: "🏦", label: "Virement" },
                ].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, payment_method: o.v }))}
                    className={`px-2 py-2.5 border rounded-xl text-center transition-colors ${form.payment_method === o.v ? "" : "border-gray-200 hover:border-gray-300"}`}
                    style={form.payment_method === o.v ? { borderColor: color, background: `${color}0D` } : {}}
                  >
                    <span className="block text-lg leading-none">{o.icon}</span>
                    <span className="block mt-1 text-[11px] font-semibold text-gray-700 leading-tight">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Récap */}
          <aside className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 lg:sticky lg:top-24">
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {cart.map(i => (
                  <div key={i.id} className="flex items-center gap-2.5">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                      {i.image_url
                        ? <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center text-lg">{i.icon_emoji}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">{i.name}</p>
                      <p className="text-[11px] text-gray-500">x{i.quantity}</p>
                    </div>
                    <p className="text-[13px] font-bold whitespace-nowrap">{fmt(i.price * i.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Sous-total</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Livraison</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                    {deliveryFee === 0 ? "Gratuite" : fmt(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-gray-100" style={{ color }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Truck, label: "Livraison rapide" },
                  { icon: Shield, label: "Paiement sécurisé" },
                  { icon: CreditCard, label: "À la livraison" },
                ].map(b => (
                  <div key={b.label} className="text-[10px] text-gray-500 flex flex-col items-center gap-1">
                    <b.icon className="h-4 w-4" style={{ color }} />
                    <span className="leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* CTA fixe */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <p className="text-[11px] text-gray-500 leading-none">Total</p>
            <p className="text-base font-bold" style={{ color }}>{fmt(total)}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim() || !form.phone.trim()}
            className="flex-1 h-13 py-3.5 text-sm font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: color }}
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</>
              : <><CheckCircle className="h-4 w-4" /> Confirmer la commande · {fmt(total)}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="ck-input w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm bg-white"
      />
    </div>
  );
}

