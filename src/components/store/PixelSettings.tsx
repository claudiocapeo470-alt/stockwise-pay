/**
 * ============================================================
 * PixelSettings.tsx — Section "Marketing & Pixels"
 * Configuration des identifiants de suivi publicitaire
 * pour la boutique en ligne du commerçant.
 * ============================================================
 */

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useShopPixels } from "@/hooks/useShopPixels";
import { PIXEL_FIELDS, type PixelPlatform, type ShopPixels } from "@/lib/pixels";

const PLATFORMS: { key: PixelPlatform; label: string; placeholder: string; help: string }[] = [
  { key: "meta", label: "Meta (Facebook / Instagram)", placeholder: "1234567890123456", help: "Gestionnaire d'événements Meta → Sources de données → votre pixel (ID à 15-16 chiffres)." },
  { key: "google_ads", label: "Google Ads", placeholder: "AW-123456789", help: "Google Ads → Objectifs → Conversions → Balise Google : identifiant au format AW-XXXXXXXXX." },
  { key: "ga4", label: "Google Analytics 4", placeholder: "G-XXXXXXXXXX", help: "Google Analytics → Admin → Flux de données → Web : identifiant de mesure G-XXXXXXXXXX." },
  { key: "tiktok", label: "TikTok", placeholder: "CXXXXXXXXXXXXXXXXXXX", help: "TikTok Ads Manager → Outils → Événements → Pixel Web : identifiant du pixel." },
  { key: "snapchat", label: "Snapchat", placeholder: "00000000-0000-0000-0000-000000000000", help: "Snapchat Ads Manager → Gestionnaire d'événements → Pixel Snap : identifiant du pixel." },
  { key: "linkedin", label: "LinkedIn", placeholder: "1234567", help: "LinkedIn Campaign Manager → Ressources → Insight Tag : Partner ID (chiffres)." },
  { key: "x", label: "X (Twitter)", placeholder: "o1abc", help: "X Ads → Outils → Gestionnaire d'événements : identifiant du pixel universel." },
];

export default function PixelSettings({ shopId }: { shopId?: string }) {
  const { pixels, isLoading, savePixels } = useShopPixels(shopId);
  const [form, setForm] = useState<ShopPixels | null>(null);

  useEffect(() => { setForm(pixels); }, [pixels]);

  if (!shopId) {
    return (
      <p className="text-sm text-muted-foreground">
        Enregistrez d'abord l'identité de votre boutique pour configurer le suivi publicitaire.
      </p>
    );
  }

  if (isLoading || !form) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  const setValue = (key: PixelPlatform, value: string) =>
    setForm(p => (p ? { ...p, [PIXEL_FIELDS[key]]: value } : p));

  const setEnabled = (key: PixelPlatform, value: boolean) =>
    setForm(p => (p ? { ...p, enabled_platforms: { ...(p.enabled_platforms || {}), [key]: value } } : p));

  const handleSave = async () => {
    try {
      await savePixels.mutateAsync({
        meta_pixel_id: form.meta_pixel_id || null,
        google_ads_conversion_id: form.google_ads_conversion_id || null,
        ga4_measurement_id: form.ga4_measurement_id || null,
        tiktok_pixel_id: form.tiktok_pixel_id || null,
        snapchat_pixel_id: form.snapchat_pixel_id || null,
        linkedin_partner_id: form.linkedin_partner_id || null,
        x_pixel_id: form.x_pixel_id || null,
        enabled_platforms: form.enabled_platforms || {},
      });
      toast.success("Pixels enregistrés");
    } catch (e: any) {
      toast.error(e.message || "Erreur d'enregistrement");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
        <Megaphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Les scripts ne se chargent sur votre boutique qu'après acceptation des cookies par le visiteur.
          Événements suivis : PageView, ViewContent, AddToCart, InitiateCheckout et Purchase.
        </p>
      </div>

      {PLATFORMS.map(p => {
        const enabled = form.enabled_platforms?.[p.key] === true;
        return (
          <div key={p.key} className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-semibold">{p.label}</Label>
              <Switch checked={enabled} onCheckedChange={v => setEnabled(p.key, v)} />
            </div>
            <Input
              value={(form[PIXEL_FIELDS[p.key]] as string) || ""}
              onChange={e => setValue(p.key, e.target.value)}
              placeholder={p.placeholder}
              className="h-10 rounded-xl font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground leading-snug">{p.help}</p>
          </div>
        );
      })}

      <Button onClick={handleSave} disabled={savePixels.isPending} className="w-full rounded-full gap-2">
        {savePixels.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer les pixels
      </Button>
    </div>
  );
}
