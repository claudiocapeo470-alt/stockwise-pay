import { useState } from "react";
import { Button } from "@/components/ui/button";

import { useOnlineStore } from "@/hooks/useOnlineStore";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";
import { Save, Store, Rocket, Copy, Check, Loader2 } from "lucide-react";

interface StoreHeaderProps {
  title?: string;
  subtitle?: string;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
}

const PUBLIC_DOMAIN = "https://www.stocknix.com";

export function StoreHeader({
  title = "Ma Boutique",
  subtitle = "Configurez et publiez votre boutique en ligne",
  onSave,
  saving = false,
}: StoreHeaderProps) {
  const { store, togglePublish } = useOnlineStore();
  const { settings } = useCompanySettings();
  const { company } = useCompany();
  const { profile } = useAuth();
  const companyLogo = settings?.logo_url || company?.logo_url || profile?.avatar_url || null;
  const [copied, setCopied] = useState(false);


  const storeUrl = store?.slug ? `${PUBLIC_DOMAIN}/boutique/${store.slug}` : "";
  // Lien partagé : toujours l'URL canonique. Le filtre Cloudflare envoie les
  // robots (WhatsApp, Facebook, LinkedIn...) vers store-og pour l'aperçu.
  const shareUrl = storeUrl;

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
    <div className="w-full rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-4 space-y-3 shadow-[0_2px_10px_hsl(var(--primary)/0.06)]">
      {/* Bienvenue + identité entreprise */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center shrink-0">
          {companyLogo ? (
            <img src={companyLogo} alt={store?.name || "Entreprise"} className="h-full w-full object-cover" />
          ) : (
            <Store className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground leading-none">Bienvenue,</p>
          <p className="text-lg font-bold truncate leading-tight mt-1">{store?.name || title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onSave && (
            <Button
              size="icon"
              variant="outline"
              onClick={onSave}
              disabled={saving}
              aria-label="Enregistrer"
              className="h-10 w-10 rounded-full border-primary/30 text-primary hover:bg-primary/10"
            >
              {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
            </Button>
          )}
          {store && (
            <Button
              size="icon"
              onClick={handlePublish}
              disabled={togglePublish.isPending}
              aria-label={store.is_published ? "Dépublier" : "Publier"}
              className={`h-10 w-10 rounded-full shadow-sm ${
                store.is_published
                  ? "bg-primary/15 text-primary hover:bg-primary/25"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <Rocket className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
      </div>

      {/* Lien de la boutique */}
      {store?.is_published && storeUrl && (
        <div className="flex items-center gap-3 border-t border-primary/10 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground leading-none">Visiter la boutique</p>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm font-semibold text-primary truncate hover:underline"
            >
              {storeUrl} ↗
            </a>
          </div>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copier le lien"
            className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}

    </div>
  );
}


export default StoreHeader;
