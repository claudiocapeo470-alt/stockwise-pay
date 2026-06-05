import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnlineStore } from "@/hooks/useOnlineStore";
import { toast } from "sonner";
import { Save, Eye, Rocket, Copy, Check, Store, Loader2 } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const storeUrl = store?.slug ? `${PUBLIC_DOMAIN}/boutique/${store.slug}` : "";

  const handlePublish = async () => {
    try {
      await togglePublish.mutateAsync();
      toast.success(store?.is_published ? "Boutique dépubliée" : "🎉 Boutique en ligne !");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
  };

  const copyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Titre + actions sur la même ligne */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSave && (
            <Button
              size="sm"
              variant="default"
              onClick={onSave}
              disabled={saving}
              className="gap-1.5 rounded-full px-4 shadow-sm"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              OK
            </Button>
          )}
          {store && (
            <Button size="sm" variant="outline" asChild className="gap-1.5 rounded-full px-4">
              <a href={storeUrl} target="_blank" rel="noopener">
                <Eye className="h-3.5 w-3.5" /> Voir
              </a>
            </Button>
          )}
          {store && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={togglePublish.isPending}
              className={`gap-1.5 rounded-full px-4 shadow-sm ${
                store.is_published
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Rocket className="h-3.5 w-3.5" />
              {store.is_published ? "Dépublier" : "Publier"}
            </Button>
          )}
        </div>
      </div>

      {/* Barre URL "En ligne" */}
      {store?.is_published && storeUrl && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="bg-emerald-600 text-white flex-shrink-0">En ligne</Badge>
            <span className="text-xs sm:text-sm font-medium truncate">{storeUrl}</span>
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 flex-shrink-0 rounded-full">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default StoreHeader;
