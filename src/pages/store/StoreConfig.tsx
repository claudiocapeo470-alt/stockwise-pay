import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOnlineStore } from "@/hooks/useOnlineStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Save, Eye, Rocket, Copy, Check, Link2, Store, Palette, Phone, Settings, ChevronLeft, ChevronRight } from "lucide-react";

const COLOR_PALETTE = [
  { name: "Indigo", value: "#4f46e5" }, { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" }, { name: "Orange", value: "#ea580c" },
  { name: "Vert", value: "#16a34a" }, { name: "Bleu", value: "#2563eb" },
  { name: "Cyan", value: "#0891b2" }, { name: "Jaune", value: "#ca8a04" },
  { name: "Rouge", value: "#dc2626" }, { name: "Gris", value: "#475569" },
  { name: "Noir", value: "#111827" }, { name: "Lime", value: "#65a30d" },
];

const STEPS = [
  { id: 1, title: "Identité", icon: Store },
  { id: 2, title: "Design", icon: Palette },
  { id: 3, title: "Contact", icon: Phone },
  { id: 4, title: "Options", icon: Settings },
];

export default function StoreConfig() {
  const { store, isLoading, upsertStore, togglePublish, checkSlugAvailability } = useOnlineStore();
  const isMobile = useIsMobile();
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", primary_color: "#4f46e5", theme_id: "classic",
    whatsapp: "+225", phone: "", email: "", address: "",
    show_stock: true, allow_orders: true, enable_reviews: true, maintenance_mode: false,
    delivery_fee: 0, delivery_info: "", free_delivery_minimum: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "", slug: store.slug || "", description: store.description || "",
        primary_color: store.primary_color || "#4f46e5", theme_id: (store as any).theme_id || "classic",
        whatsapp: store.whatsapp || "+225", phone: store.phone || "", email: store.email || "",
        address: store.address || "", show_stock: store.show_stock, allow_orders: store.allow_orders,
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

  // URL canonique publique (toujours stocknix.com une fois DNS propagé).
  // Fallback intelligent : si on est sur le domaine officiel ou son sous-domaine www, on garde stocknix.com,
  // sinon (preview / lovable.app) on utilise l'origine actuelle pour que le lien marche immédiatement.
  const PUBLIC_DOMAIN = 'https://stocknix.com';
  const getBaseUrl = () => {
    if (typeof window === 'undefined') return PUBLIC_DOMAIN;
    const host = window.location.hostname;
    // Sur le domaine officiel ou en production lovable, on privilégie le domaine canonique
    if (host === 'stocknix.com' || host === 'www.stocknix.com') return PUBLIC_DOMAIN;
    // Sinon (preview, lovable.app, localhost) on utilise l'origine pour garantir un lien cliquable
    return window.location.origin;
  };
  const storeUrl = `${getBaseUrl()}/boutique/${form.slug}`;
  const copyUrl = () => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Ma Boutique
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Configurez et publiez votre boutique en ligne</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size={isMobile ? "sm" : "default"} onClick={handleSave} disabled={upsertStore.isPending} className="gap-1.5">
            <Save className="h-4 w-4" />{upsertStore.isPending ? "..." : "Enregistrer"}
          </Button>
          {store && (
            <Button size={isMobile ? "sm" : "default"} variant="outline" asChild className="gap-1.5">
              <a href={storeUrl} target="_blank" rel="noopener"><Eye className="h-4 w-4" />{!isMobile && "Voir"}</a>
            </Button>
          )}
          {store && (
            <Button size={isMobile ? "sm" : "default"} onClick={handlePublish} disabled={togglePublish.isPending}
              className={`gap-1.5 ${store.is_published ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              <Rocket className="h-4 w-4" />{store.is_published ? "Dépublier" : "Publier"}
            </Button>
          )}
        </div>
      </div>

      {/* Published URL bar */}
      {store?.is_published && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="bg-green-600 text-white flex-shrink-0">En ligne</Badge>
            <span className="text-xs sm:text-sm font-medium truncate">{storeUrl}</span>
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 flex-shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      )}

      {/* Wizard steps - horizontal scroll on mobile */}
      <div className="flex items-center gap-0 py-2 overflow-x-auto no-scrollbar">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : currentStep > step.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <span className="hidden xs:inline sm:inline">{step.title}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-4 sm:w-8 lg:w-12 h-0.5 mx-0.5 sm:mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Identité de la boutique</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nom de la boutique *</Label>
                    <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ma Boutique" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Décrivez votre boutique..." />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg flex items-center gap-2"><Link2 className="h-4 w-4" /> URL de votre boutique</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 sm:p-4 bg-muted rounded-xl space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">stocknix.com/boutique/</p>
                    <Input value={form.slug} onChange={e => handleSlugChange(e.target.value)} placeholder="mon-magasin" className="font-mono text-sm" />
                    {slugChecking && <p className="text-xs text-muted-foreground">Vérification...</p>}
                    {slugAvailable === true && form.slug.length >= 3 && <p className="text-xs text-green-600">✅ Disponible</p>}
                    {slugAvailable === false && <p className="text-xs text-destructive">❌ Déjà pris</p>}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Design */}
          {currentStep === 2 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">🎨 Couleur de la boutique</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">✨</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Design "La Zone" — Premium</p>
                      <p className="text-xs text-muted-foreground mt-1">Hero immersif, dark mode, animations fluides, panier latéral, checkout intégré. Un seul thème, parfaitement optimisé.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block text-sm">Couleur principale</Label>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {COLOR_PALETTE.map(c => (
                      <button key={c.value} onClick={() => setForm(p => ({ ...p, primary_color: c.value }))}
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 transition-all flex items-center justify-center ${form.primary_color === c.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ background: c.value }} title={c.name}>
                        {form.primary_color === c.value && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Contact & Delivery */}
          {currentStep === 3 && (
            <>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">📞 Contact</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" /></div>
                  <div className="space-y-1.5"><Label>Adresse</Label><Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">🚚 Livraison</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Frais de livraison (FCFA)</Label><Input type="number" min="0" value={form.delivery_fee} onChange={e => setForm(p => ({ ...p, delivery_fee: Number(e.target.value) }))} /></div>
                    <div className="space-y-1.5"><Label>Gratuit à partir de (FCFA)</Label><Input type="number" min="0" value={form.free_delivery_minimum} onChange={e => setForm(p => ({ ...p, free_delivery_minimum: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Informations livraison</Label><Textarea value={form.delivery_info} onChange={e => setForm(p => ({ ...p, delivery_info: e.target.value }))} rows={2} /></div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 4: Options */}
          {currentStep === 4 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">⚙️ Options de la boutique</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'show_stock', label: 'Afficher le stock', desc: 'Les clients voient "X en stock"' },
                  { key: 'allow_orders', label: 'Accepter les commandes', desc: 'Désactiver = lecture seule' },
                  { key: 'enable_reviews', label: 'Avis clients', desc: 'Permettre les avis et notes' },
                  { key: 'maintenance_mode', label: 'Mode maintenance', desc: '"Bientôt disponible"' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={(form as any)[item.key]} onCheckedChange={v => setForm(p => ({ ...p, [item.key]: v }))} className="flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            {currentStep < 4 ? (
              <Button size={isMobile ? "sm" : "default"} onClick={() => setCurrentStep(s => Math.min(4, s + 1))} className="gap-1.5">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size={isMobile ? "sm" : "default"} onClick={handleSave} disabled={upsertStore.isPending} className="gap-1.5">
                <Save className="h-4 w-4" /> {upsertStore.isPending ? "..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>

        {/* Preview sidebar - hidden on mobile */}
        {!isMobile && (
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Aperçu — Design La Zone</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                  <div className="h-24 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}dd)` }}>
                    <span className="text-white font-bold text-lg tracking-tight">{form.name || "Votre Boutique"}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="bg-card p-3 border border-border text-center">
                          <div className="text-2xl mb-1">📦</div>
                          <div className="h-2 bg-muted w-3/4 mx-auto" />
                          <div className="h-2 w-1/2 mx-auto mt-1" style={{ background: `${form.primary_color}40` }} />
                          <div className="h-5 mt-2 text-[9px] flex items-center justify-center text-white font-bold" style={{ background: form.primary_color }}>AJOUTER</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!store?.is_published && <div className="text-center py-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 text-xs font-medium border-t">APERÇU — Non publié</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
