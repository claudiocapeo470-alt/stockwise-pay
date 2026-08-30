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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all",
        onClick &&
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Visuel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={typeof name === "string" ? name : ""}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {badge && <div className="absolute left-2 top-2">{badge}</div>}

        {actions && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-[13px] sm:text-sm font-semibold leading-tight">{name}</p>
        {meta && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">{meta}</div>
        )}
        {price && <p className="mt-auto pt-1 text-[15px] sm:text-base font-bold tabular-nums leading-none">{price}</p>}
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
