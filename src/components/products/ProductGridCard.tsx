import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

/**
 * Grille de produits façon catalogue compacte :
 * 2 colonnes sur mobile, 4 sur tablette (md), 5 sur desktop (lg), 6 sur xl.
 */
export function ProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * Carte produit minimaliste et compacte :
 * - visuel plein cadre en haut (coins arrondis, pas de contour dur)
 * - badge de statut discret posé sur l'image
 * - informations très sobres, prix mis en avant
 * - actions (modifier / supprimer) en bas de carte, boutons fantômes ronds
 */
export function ProductGridCard({
  image,
  name,
  badge,
  meta,
  price,
  priceAction,
  footer,
  onClick,
  actions,
  className,
}: {
  image?: string | null;
  name: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  price?: ReactNode;
  priceAction?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border/40 transition-all duration-200 hover:ring-border/80 hover:shadow-[0_4px_12px_-8px_hsl(var(--foreground)/0.14)] active:scale-[0.99]",
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Visuel plein cadre */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {image ? (
          <img
            src={image}
            alt={typeof name === "string" ? name : ""}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground/30" />
          </div>
        )}

        {badge && <div className="absolute left-2 top-2">{badge}</div>}
      </div>

      {/* Infos compactes */}
      <div className="flex flex-1 flex-col gap-0 px-1.5 pb-1.5 pt-1.5">
        <p className="truncate text-[11px] sm:text-[12px] font-semibold leading-tight">{name}</p>
        {meta && (
          <div className="flex flex-wrap items-center gap-x-1.5 text-[9px] sm:text-[10px] text-muted-foreground leading-none">{meta}</div>
        )}

        {(price || priceAction) && (
          <div className="mt-0.5 flex items-center justify-between gap-1">
            {price && <p className="text-[11px] sm:text-[12px] font-bold tabular-nums leading-none truncate">{price}</p>}
            {priceAction && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                {priceAction}
              </div>
            )}
          </div>
        )}

        {actions && (
          <div
            className="mt-0.5 flex items-center justify-end gap-0"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}

        {footer}
      </div>
    </div>
  );
}



/** Petite info secondaire (icône + texte) dans la zone meta d'une carte produit. */
export function ProductMeta({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 truncate", className)}>
      {icon}
      {children}
    </span>
  );
}
