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

const fmt = (n: number) => `${n.toLocaleString("fr-FR")} CFA`;

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
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/boutique/${slug}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-8 object-cover" />
            ) : (
              <div className="h-8 w-8 flex items-center justify-center text-white text-[10px] font-bold" style={{ background: color }}>
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold tracking-tight truncate text-sm md:text-base">{store.name}</span>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">Paiement sécurisé</div>
          <div className="sm:hidden w-6" />
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-1">Finaliser la commande</h1>
        <p className="text-sm text-gray-500 mb-6 md:mb-8">Remplissez vos informations pour valider votre achat.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Formulaire — 3 colonnes */}
          <section className="lg:col-span-3 space-y-6">
            {/* Coordonnées */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: color }}>1</span>
                Vos coordonnées
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom complet *" placeholder="Jean Dupont" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Field label="Téléphone *" type="tel" placeholder="+225 07 XX XX XX XX" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                <div className="sm:col-span-2">
                  <Field label="Email" type="email" placeholder="exemple@mail.com" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
                </div>
              </div>
            </div>

            {/* Livraison */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: color }}>2</span>
                Adresse de livraison
              </h2>
              <Field
                label="Adresse complète"
                placeholder="Quartier, Rue, Ville"
                value={form.address}
                onChange={v => setForm(p => ({ ...p, address: v }))}
              />
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes (optionnel)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Instructions spéciales pour la livraison…"
                  className="ck-input w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none bg-white"
                />
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: color }}>3</span>
                Mode de paiement
              </h2>
              <div className="space-y-2">
                {[
                  { v: "cash_on_delivery", icon: "💵", label: "Paiement à la livraison", desc: "Payez en espèces à la réception" },
                  { v: "mobile_money", icon: "📱", label: "Mobile Money", desc: "MTN, Orange, Moov, Wave" },
                  { v: "bank_transfer", icon: "🏦", label: "Virement bancaire", desc: "Le vendeur vous contactera" },
                ].map(o => (
                  <label
                    key={o.v}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.payment_method === o.v ? "" : "border-gray-200 hover:border-gray-300"}`}
                    style={form.payment_method === o.v ? { borderColor: color, background: `${color}08` } : {}}
                  >
                    <input
                      type="radio"
                      checked={form.payment_method === o.v}
                      onChange={() => setForm(p => ({ ...p, payment_method: o.v }))}
                      className="mt-1 accent-current"
                      style={{ accentColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <span>{o.icon}</span>{o.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{o.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Récap — 2 colonnes */}
          <aside className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Récapitulatif</h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map(i => (
                  <div key={i.id} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                      {i.image_url
                        ? <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center text-2xl">{i.icon_emoji}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{i.name}</p>
                      <p className="text-xs text-gray-500">Quantité : {i.quantity}</p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">{fmt(i.price * i.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-5 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                    {deliveryFee === 0 ? "Gratuite" : fmt(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100" style={{ color }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name.trim() || !form.phone.trim()}
                className="mt-5 w-full py-4 text-sm font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                style={{ background: color }}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</>
                  : <><CheckCircle className="h-4 w-4" /> Confirmer la commande</>}
              </button>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="ck-input w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white"
      />
    </div>
  );
}
