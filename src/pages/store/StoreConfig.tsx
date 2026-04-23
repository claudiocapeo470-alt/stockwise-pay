import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOnlineStore } from "@/hooks/useOnlineStore";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Save, Eye, Rocket, Copy, Check, Link2, Store, Palette,
  Phone, ChevronLeft, ChevronRight, Image as ImageIcon, Upload, Trash2, Loader2, Sparkles, Tags,
} from "lucide-react";
import CategoryManager from "@/components/store/CategoryManager";

const COLOR_PALETTE = [
  { name: "Indigo", value: "#4f46e5" }, { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" }, { name: "Orange", value: "#ea580c" },
  { name: "Vert", value: "#16a34a" }, { name: "Bleu", value: "#2563eb" },
  { name: "Cyan", value: "#0891b2" }, { name: "Jaune", value: "#ca8a04" },
  { name: "Rouge", value: "#dc2626" }, { name: "Gris", value: "#475569" },
  { name: "Noir", value: "#111827" }, { name: "Lime", value: "#65a30d" },
];

// 3 étapes au lieu de 4
const STEPS = [
  { id: 1, title: "Identité", icon: Store, desc: "Nom et URL de votre boutique" },
  { id: 2, title: "Design", icon: Palette, desc: "Couleur et bannière" },
  { id: 3, title: "Contact", icon: Phone, desc: "Coordonnées et options" },
];

const MAX_BANNER_SIZE = 3 * 1024 * 1024; // 3 MB

export default function StoreConfig() {
  const { store, isLoading, upsertStore, togglePublish, checkSlugAvailability } = useOnlineStore();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", primary_color: "#4f46e5",
    whatsapp: "+225", phone: "", email: "", address: "",
    banner_url: "" as string,
    show_stock: true, allow_orders: true, enable_reviews: true, maintenance_mode: false,
    delivery_fee: 0, delivery_info: "", free_delivery_minimum: 0,
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "", slug: store.slug || "", description: store.description || "",
        primary_color: store.primary_color || "#4f46e5",
        whatsapp: store.whatsapp || "+225", phone: store.phone || "", email: store.email || "",
        address: store.address || "",
        banner_url: store.banner_url || "",
        show_stock: store.show_stock, allow_orders: store.allow_orders,
        enable_reviews: store.enable_reviews, maintenance_mode: store.maintenance_mode,
        delivery_fee: store.delivery_fee || 0, delivery_info: store.delivery_info || "",
        free_delivery_minimum: store.free_delivery_minimum || 0,
      });
    }
  }, [store]);

  const handleNameChange = (name: string) => {
    setForm(p => ({ ...p, name }));
    if (!store) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
      setForm(p => ({ ...p, slug }));
      checkSlug(slug);
    }
  };

  const handleSlugChange = (raw: string) => {
    const slug = raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm(p => ({ ...p, slug }));
    checkSlug(slug);
  };

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const available = await checkSlugAvailability(slug);
    setSlugAvailable(available);
    setSlugChecking(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Nom et slug requis"); return; }
    if (slugAvailable === false) { toast.error("Ce slug est déjà pris"); return; }
    try {
      await upsertStore.mutateAsync(form as any);
      toast.success("Boutique enregistrée !");
    } catch (e: any) { toast.error(e.message || "Erreur"); }
  };

  const handlePublish = async () => {
    try {
      await togglePublish.mutateAsync();
      toast.success(store?.is_published ? "Boutique dépubliée" : "🎉 Boutique en ligne !");
    } catch (e: any) { toast.error(e.message); }
  };

  // ─── UPLOAD BANNIÈRE ────────────────────────────────────────────────
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_BANNER_SIZE) {
      toast.error("Image trop lourde — maximum 3 Mo");
      e.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WebP uniquement)");
      e.target.value = "";
      return;
    }

    setUploadingBanner(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/banner-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('store-banners').upload(path, file, {
        cacheControl: '3600', upsert: false,
      });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('store-banners').getPublicUrl(path);
      setForm(p => ({ ...p, banner_url: publicUrl }));
      toast.success("Bannière chargée — n'oubliez pas d'enregistrer");
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement");
    } finally {
      setUploadingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    setForm(p => ({ ...p, banner_url: "" }));
    toast.info("Bannière retirée — enregistrez pour valider");
  };

  // ─── URL CANONIQUE ────────────────────────────────────────────────
  // Toujours afficher/copier le domaine officiel, jamais lovable.app/lovableproject.com
  const PUBLIC_DOMAIN = 'https://www.stocknix.com';
  const storeUrl = `${PUBLIC_DOMAIN}/boutique/${form.slug}`;
  const copyUrl = () => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in max-w-5xl mx-auto pb-6">
      {/* ────────────────────────────────────────────────────────────
           HEADER : titre + boutons sur la MÊME LIGNE (responsive)
         ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ma Boutique</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configurez et publiez votre boutique en ligne
            </p>
          </div>
        </div>

        {/* Actions — toutes sur la même ligne que le titre */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={upsertStore.isPending}
            className="gap-1.5 rounded-full px-4 shadow-sm"
          >
            {upsertStore.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden xs:inline">Enregistrer</span>
            <span className="xs:hidden">OK</span>
          </Button>
          {store && (
            <Button size="sm" variant="outline" asChild className="gap-1.5 rounded-full px-4">
              <a href={storeUrl} target="_blank" rel="noopener">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Voir</span>
              </a>
            </Button>
          )}
          {store && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={togglePublish.isPending}
              className={`gap-1.5 rounded-full px-4 shadow-sm ${store.is_published
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              <Rocket className="h-3.5 w-3.5" />
              {store.is_published ? "Dépublier" : "Publier"}
            </Button>
          )}
        </div>
      </div>

      {/* URL publiée */}
      {store?.is_published && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <Badge className="bg-emerald-600 text-white flex-shrink-0">En ligne</Badge>
            <span className="text-xs sm:text-sm font-medium truncate">{storeUrl}</span>
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 flex-shrink-0 rounded-full">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
           STEPPER 3 ÉTAPES — design simple
         ──────────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-1">
          {STEPS.map((step, i) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-1.5 group flex-shrink-0"
                >
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isDone
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-medium ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${isDone ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Étape {currentStep} sur {STEPS.length} — {STEPS[currentStep - 1].desc}
        </p>
      </div>

      {/* ────────────────────────────────────────────────────────────
           CONTENU PAR ÉTAPE
         ──────────────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* ÉTAPE 1 — IDENTITÉ */}
          {currentStep === 1 && (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Store className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Identité de la boutique</h2>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Nom de la boutique <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ex : Lumix Store"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Description (optionnel)</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Décrivez votre boutique en quelques mots…"
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  URL personnalisée
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap">
                    stocknix.com/boutique/
                  </span>
                  <Input
                    value={form.slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="mon-magasin"
                    className="h-9 font-mono text-sm bg-background rounded-lg flex-1"
                  />
                </div>
                {slugChecking && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Vérification…</p>}
                {slugAvailable === true && form.slug.length >= 3 && <p className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Disponible</p>}
                {slugAvailable === false && <p className="text-xs text-destructive">❌ Cette adresse est déjà prise</p>}
              </div>
            </>
          )}

          {/* ÉTAPE 2 — DESIGN (couleur + bannière) */}
          {currentStep === 2 && (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Apparence visuelle</h2>
              </div>

              {/* Couleur */}
              <div>
                <Label className="text-sm mb-3 block">Couleur principale</Label>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm(p => ({ ...p, primary_color: c.value }))}
                      className={`h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${form.primary_color === c.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ background: c.value }}
                      title={c.name}
                    >
                      {form.primary_color === c.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bannière hero */}
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-sm flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image de bannière (page d'accueil)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format recommandé : large (16:9), max 3 Mo (JPG, PNG, WebP)
                  </p>
                </div>

                {form.banner_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-border">
                    <img
                      src={form.banner_url}
                      alt="Bannière de la boutique"
                      className="w-full h-40 sm:h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="rounded-full"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        Remplacer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveBanner}
                        className="rounded-full"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Retirer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full h-40 sm:h-56 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm font-medium">Chargement…</p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Cliquer pour téléverser</p>
                        <p className="text-xs">JPG, PNG, WebP · 3 Mo max</p>
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  La bannière s'affiche en grand sur la page d'accueil de votre boutique.
                  Choisissez une image de qualité qui représente bien vos produits.
                </p>
              </div>

              {/* GESTION DES CATÉGORIES */}
              <div className="border-t border-border pt-6">
                <CategoryManager />
              </div>
            </>
          )}

          {/* ÉTAPE 3 — CONTACT + LIVRAISON + OPTIONS */}
          {currentStep === 3 && (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Phone className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Contact, livraison & options</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Téléphone</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className="h-11 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Adresse physique</Label>
                <Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className="rounded-xl resize-none" />
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-bold mb-3">🚚 Livraison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Frais de livraison (FCFA)</Label>
                    <Input type="number" min="0" value={form.delivery_fee} onChange={e => setForm(p => ({ ...p, delivery_fee: Number(e.target.value) }))} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Gratuit dès (FCFA)</Label>
                    <Input type="number" min="0" value={form.free_delivery_minimum} onChange={e => setForm(p => ({ ...p, free_delivery_minimum: Number(e.target.value) }))} className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-bold mb-3">⚙️ Options</h3>
                <div className="space-y-2">
                  {[
                    { key: 'show_stock', label: 'Afficher le stock', desc: 'Les clients voient "X en stock"' },
                    { key: 'allow_orders', label: 'Accepter les commandes', desc: 'Désactiver pour mode lecture seule' },
                    { key: 'enable_reviews', label: 'Avis clients', desc: 'Permettre les avis et notes' },
                    { key: 'maintenance_mode', label: 'Mode maintenance', desc: 'Afficher "Bientôt disponible"' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={(form as any)[item.key]} onCheckedChange={v => setForm(p => ({ ...p, [item.key]: v }))} className="flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* NAVIGATION ENTRE ÉTAPES */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="gap-1.5 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            {currentStep < STEPS.length ? (
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={() => setCurrentStep(s => Math.min(STEPS.length, s + 1))}
                className="gap-1.5 rounded-full"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={handleSave}
                disabled={upsertStore.isPending}
                className="gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700"
              >
                {upsertStore.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
