import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

/**
 * Grille de produits façon catalogue :
 * 2 colonnes sur mobile, 3 sur tablette (md), 4 sur desktop (lg+).
 */
export function ProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4", className)}>
      {children}
    </div>
  );
}

/**
 * Carte produit minimaliste :
 * - visuel plein cadre en haut (coins arrondis, aucun contour dur)
 * - badge de statut discret posé sur l'image
 * - informations sobres, prix mis en avant
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
        "group relative flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border/50 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-all duration-200 hover:ring-border hover:shadow-[0_8px_24px_-12px_hsl(var(--foreground)/0.25)] active:scale-[0.99]",
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
            <Package className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {badge && <div className="absolute left-2.5 top-2.5">{badge}</div>}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-2.5 pt-2.5">
        <p className="truncate text-[13px] sm:text-sm font-semibold leading-tight">{name}</p>
        {meta && (
          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">{meta}</div>
        )}

        {(price || priceAction) && (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {price && <p className="text-[15px] sm:text-base font-bold tabular-nums leading-none truncate">{price}</p>}
            {priceAction && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                {priceAction}
              </div>
            )}
          </div>
        )}

        {actions && (
          <div
            className="mt-2 flex items-center justify-end gap-1"
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
    <span className={cn("inline-flex items-center gap-1 truncate", className)}>
      {icon}
      {children}
    </span>
  );
}
