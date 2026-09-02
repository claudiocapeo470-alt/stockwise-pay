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
 * Carte produit visuelle : photo en haut, informations compactes en bas.
 * - meta : ligne d'informations secondaires (icônes + texte)
 * - price : prix mis en avant
 * - actions : boutons flottants en haut à droite de la photo
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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-foreground bg-card p-1.5 transition-transform active:scale-[0.99]",
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Visuel */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/60">
        {image ? (
          <img
            src={image}
            alt={typeof name === "string" ? name : ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {badge && <div className="absolute left-2 top-2">{badge}</div>}

        {actions && (
          <div
            className="absolute right-1.5 top-1.5 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-1 px-2 pb-1.5 pt-2">
        <p className="truncate text-[13px] sm:text-sm font-semibold leading-tight">{name}</p>
        {meta && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">{meta}</div>
        )}
        {(price || priceAction) && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
            {price && <p className="text-[15px] sm:text-base font-bold tabular-nums leading-none truncate">{price}</p>}
            {priceAction && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                {priceAction}
              </div>
            )}
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
