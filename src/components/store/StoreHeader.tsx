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
    <div className="w-full flex items-center gap-2">
      {/* Bloc URL "En ligne" — prend l'espace disponible */}
      {store?.is_published && storeUrl && (
        <div className="h-11 flex-1 min-w-0 bg-success/10 border border-success/20 rounded-xl px-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate flex-1 min-w-0">{storeUrl}</span>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copier le lien"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Actions — icônes rondes, même gabarit partout */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {onSave && (
          <Button size="icon" onClick={onSave} disabled={saving} aria-label="Enregistrer" className="h-11 w-11 rounded-xl">
            {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
          </Button>
        )}
        {store && (
          <Button size="icon" variant="outline" asChild aria-label="Ouvrir la boutique" title="Ouvrir la boutique" className="h-11 w-11 rounded-xl">
            <a href={storeUrl} target="_blank" rel="noopener"><Store className="h-[18px] w-[18px]" /></a>
          </Button>
        )}
        {store && (
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={togglePublish.isPending}
            className={`h-11 rounded-xl px-4 gap-1.5 ${
              store.is_published
                ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                : "bg-success hover:bg-success/90 text-success-foreground"
            }`}
          >
            <Rocket className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">{store.is_published ? "Dépublier" : "Publier"}</span>
          </Button>
        )}
      </div>
    </div>
  );
}


export default StoreHeader;
