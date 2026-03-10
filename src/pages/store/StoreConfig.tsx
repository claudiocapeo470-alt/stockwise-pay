import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOnlineStore } from "@/hooks/useOnlineStore";
import { toast } from "sonner";
import { Save, Eye, Rocket, Copy, Check, Link2 } from "lucide-react";

const THEMES = [
  { id: "classic", name: "Classique", desc: "Bannière + grille 3 colonnes" },
  { id: "modern", name: "Moderne", desc: "Hero plein écran + 4 colonnes" },
  { id: "minimal", name: "Minimaliste", desc: "Épuré, 2 colonnes, pas de bannière" },
  { id: "boutique", name: "Boutique locale", desc: "Couleurs vives, 2 colonnes" },
  { id: "magazine", name: "Magazine", desc: "Éditorial, carrousel vedettes" },
];

const COLOR_PALETTE = [
  { name: "Indigo", value: "#4f46e5" }, { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" }, { name: "Orange", value: "#ea580c" },
  { name: "Vert", value: "#16a34a" }, { name: "Bleu", value: "#2563eb" },
  { name: "Cyan", value: "#0891b2" }, { name: "Jaune", value: "#ca8a04" },
  { name: "Rouge", value: "#dc2626" }, { name: "Gris", value: "#475569" },
  { name: "Noir", value: "#111827" }, { name: "Lime", value: "#65a30d" },
];

export default function StoreConfig() {
  const { store, isLoading, upsertStore, togglePublish, checkSlugAvailability } = useOnlineStore();
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
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
    if (!store) { const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'); setForm(p => ({ ...p, slug })); checkSlug(slug); }
  };

  const handleSlugChange = (raw: string) => { const slug = raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); setForm(p => ({ ...p, slug })); checkSlug(slug); };

  const checkSlug = async (slug: string) => { if (!slug || slug.length < 3) { setSlugAvailable(null); return; } setSlugChecking(true); const available = await checkSlugAvailability(slug); setSlugAvailable(available); setSlugChecking(false); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Nom et slug requis"); return; }
    if (slugAvailable === false) { toast.error("Ce slug est déjà pris"); return; }
    try { await upsertStore.mutateAsync(form as any); toast.success("Boutique enregistrée !"); } catch (e: any) { toast.error(e.message || "Erreur"); }
  };

  const handlePublish = async () => { try { await togglePublish.mutateAsync(); toast.success(store?.is_published ? "Boutique dépubliée" : "🎉 Boutique en ligne !"); } catch (e: any) { toast.error(e.message); } };

  const storeUrl = `${window.location.origin}/boutique/${form.slug}`;
  const copyUrl = () => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">🛍️ Ma Boutique</h1><p className="text-sm text-muted-foreground">Configurez et publiez votre boutique en ligne</p></div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSave} disabled={upsertStore.isPending} className="gap-2"><Save className="h-4 w-4" />{upsertStore.isPending ? "..." : "💾 Enregistrer"}</Button>
          {store && <Button variant="outline" asChild className="gap-2"><a href={storeUrl} target="_blank" rel="noopener"><Eye className="h-4 w-4" />👁 Voir</a></Button>}
          {store && <Button onClick={handlePublish} disabled={togglePublish.isPending} className={`gap-2 ${store.is_published ? 'bg-warning hover:bg-warning/90 text-warning-foreground' : 'bg-green-600 hover:bg-green-700 text-white'}`}><Rocket className="h-4 w-4" />{store.is_published ? "Dépublier" : "🚀 Publier"}</Button>}
        </div>
      </div>

      {store?.is_published && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2"><Badge className="bg-green-600 text-white">En ligne</Badge><span className="text-sm font-medium">{storeUrl}</span></div>
          <Button variant="outline" size="sm" onClick={copyUrl} className="gap-2">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copié !" : "Copier"}</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Identité de la boutique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Nom *</Label><Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ma Boutique" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            </CardContent>
          </Card>

          {/* Theme Selector */}
          <Card>
            <CardHeader><CardTitle>🎨 Thème & Couleurs</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Choisir un thème</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setForm(p => ({ ...p, theme_id: t.id }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${form.theme_id === t.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30'}`}>
                      <div className="h-12 rounded-lg bg-muted mb-2 flex items-center justify-center text-xs font-mono text-muted-foreground">{t.id}</div>
                      <p className="text-xs font-semibold">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Couleur principale</Label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_PALETTE.map(c => (
                    <button key={c.value} onClick={() => setForm(p => ({ ...p, primary_color: c.value }))}
                      className={`h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${form.primary_color === c.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ background: c.value }} title={c.name}>
                      {form.primary_color === c.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>🌐 URL</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm"><Link2 className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">stocknix.space/boutique/</span></div>
                <Input value={form.slug} onChange={e => handleSlugChange(e.target.value)} placeholder="mon-magasin" className="font-mono" />
                {slugChecking && <p className="text-xs text-muted-foreground">Vérification...</p>}
                {slugAvailable === true && form.slug.length >= 3 && <p className="text-xs text-green-600">✅ Disponible</p>}
                {slugAvailable === false && <p className="text-xs text-destructive">❌ Déjà pris</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} /></div>
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" /></div>
              <div><Label>Adresse</Label><Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_stock', label: 'Afficher le stock', desc: 'Les clients voient "X en stock"' },
                { key: 'allow_orders', label: 'Accepter les commandes', desc: 'Désactiver = lecture seule' },
                { key: 'enable_reviews', label: 'Avis clients', desc: '' },
                { key: 'maintenance_mode', label: 'Mode maintenance', desc: '"Bientôt disponible"' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{item.label}</p>{item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}</div>
                  <Switch checked={(form as any)[item.key]} onCheckedChange={v => setForm(p => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Livraison</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Frais (FCFA)</Label><Input type="number" min="0" value={form.delivery_fee} onChange={e => setForm(p => ({ ...p, delivery_fee: Number(e.target.value) }))} /></div>
              <div><Label>Infos livraison</Label><Textarea value={form.delivery_info} onChange={e => setForm(p => ({ ...p, delivery_info: e.target.value }))} rows={2} /></div>
              <div><Label>Gratuit à partir de (FCFA)</Label><Input type="number" min="0" value={form.free_delivery_minimum} onChange={e => setForm(p => ({ ...p, free_delivery_minimum: Number(e.target.value) }))} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader><CardTitle className="text-sm">Aperçu — {THEMES.find(t => t.id === form.theme_id)?.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {form.theme_id !== 'minimal' && (
                  <div className="h-20 flex items-center justify-center" style={{ background: form.primary_color }}>
                    <span className="text-white font-bold text-lg">{form.name || "Votre Boutique"}</span>
                  </div>
                )}
                {form.theme_id === 'minimal' && <div className="p-3"><p className="text-lg font-light">{form.name || "Boutique"}</p></div>}
                <div className="p-3 space-y-2">
                  <div className={`grid ${form.theme_id === 'minimal' ? 'grid-cols-1' : form.theme_id === 'modern' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                    {[1,2,3,4].slice(0, form.theme_id === 'minimal' ? 2 : 4).map(i => (
                      <div key={i} className={`bg-card ${form.theme_id === 'boutique' ? 'rounded-2xl' : form.theme_id === 'minimal' ? 'rounded-none' : 'rounded-lg'} p-3 border border-border text-center`}>
                        <div className="text-2xl mb-1">📦</div>
                        <div className="h-2 bg-muted rounded w-3/4 mx-auto" />
                        <div className="h-2 rounded w-1/2 mx-auto mt-1" style={{ background: `${form.primary_color}40` }} />
                      </div>
                    ))}
                  </div>
                </div>
                {!store?.is_published && <div className="text-center py-2 bg-warning/10 text-warning text-xs font-medium border-t">APERÇU — Non publié</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
