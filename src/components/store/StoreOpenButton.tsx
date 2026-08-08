import { Button } from "@/components/ui/button";
import { useOnlineStore } from "@/hooks/useOnlineStore";
import { Store } from "lucide-react";

const PUBLIC_DOMAIN = "https://www.stocknix.com";

/** Bouton rond "Ouvrir la boutique" — placé en haut à gauche de l'en-tête. */
export function StoreOpenButton() {
  const { store } = useOnlineStore();
  if (!store?.slug) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      title="Ouvrir ma boutique"
      aria-label="Ouvrir ma boutique"
      className="h-10 w-10 rounded-full bg-muted/40 border border-border hover:bg-muted text-foreground"
    >
      <a href={`${PUBLIC_DOMAIN}/boutique/${store.slug}`} target="_blank" rel="noopener">
        <Store className="h-[18px] w-[18px]" />
      </a>
    </Button>
  );
}

export default StoreOpenButton;
