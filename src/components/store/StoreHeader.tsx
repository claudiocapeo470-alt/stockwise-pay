import { useState } from "react";
import { Button } from "@/components/ui/button";

import { useOnlineStore } from "@/hooks/useOnlineStore";
import { toast } from "sonner";
import { Save, Store, Rocket, Copy, Check, Loader2 } from "lucide-react";

interface StoreHeaderProps {
  title?: string;
  subtitle?: string;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
}

const PUBLIC_DOMAIN = "https://www.stocknix.com";
const SHARE_ENDPOINT = "https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/store-og";

export function StoreHeader({
  title = "Ma Boutique",
  subtitle = "Configurez et publiez votre boutique en ligne",
  onSave,
  saving = false,
}: StoreHeaderProps) {
  const { store, togglePublish } = useOnlineStore();
  const [copied, setCopied] = useState(false);

  const storeUrl = store?.slug ? `${PUBLIC_DOMAIN}/boutique/${store.slug}` : "";
  // Smart link : les crawlers (WhatsApp, Facebook, LinkedIn...) reçoivent
  // les meta OG de la boutique, les humains sont redirigés vers l'URL propre.
  const shareUrl = store?.slug ? `${SHARE_ENDPOINT}?slug=${encodeURIComponent(store.slug)}` : "";

  const handlePublish = async () => {
    try {
      await togglePublish.mutateAsync();
      toast.success(store?.is_published ? "Boutique dépubliée" : "🎉 Boutique en ligne !");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
  };

  const copyUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien de partage copié — nom et logo s'afficheront sur WhatsApp/Facebook/LinkedIn.");
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="w-full rounded-2xl bg-card border border-border/60 p-4 space-y-3">
      {/* Bienvenue + identité boutique */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {store?.banner_url ? (
            <img src={store.banner_url} alt={store?.name || "Boutique"} className="h-full w-full object-cover" />
          ) : (
            <Store className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground leading-none">Bienvenue,</p>
          <p className="text-lg font-bold truncate leading-tight mt-1">{store?.name || title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onSave && (
            <Button size="icon" variant="outline" onClick={onSave} disabled={saving} aria-label="Enregistrer" className="h-10 w-10 rounded-full">
              {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
            </Button>
          )}
          {store && (
            <Button
              size="icon"
              onClick={handlePublish}
              disabled={togglePublish.isPending}
              aria-label={store.is_published ? "Dépublier" : "Publier"}
              className={`h-10 w-10 rounded-full ${
                store.is_published
                  ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                  : "bg-success hover:bg-success/90 text-success-foreground"
              }`}
            >
              <Rocket className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
      </div>

      {/* Lien de la boutique */}
      {store?.is_published && storeUrl && (
        <div className="flex items-center gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground leading-none">Visiter la boutique</p>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm font-semibold text-success truncate hover:underline"
            >
              {storeUrl} ↗
            </a>
          </div>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copier le lien"
            className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 hover:bg-success/20 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}


export default StoreHeader;
