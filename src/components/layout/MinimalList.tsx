import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Conteneur de contenu en **grille de cartes** (remplace l'ancien affichage en liste).
 * 1 colonne sur mobile, 2 à partir de sm, 3 à partir de xl.
 */
export function ListShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="list"
      className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4", className)}
    >
      {children}
    </div>
  );
}

/**
 * Carte d'entité (mobile, tablette et desktop).
 * - leading : avatar / image / icône ronde
 * - title + badge, subtitle en dessous
 * - value + hint alignés en bas à droite
 * - actions : menu ou boutons, en haut à droite
 */
export function ListRow({
  leading,
  title,
  badge,
  subtitle,
  meta,
  value,
  hint,
  actions,
  onClick,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  badge?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      role="listitem"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
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
        "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all",
        onClick &&
          "cursor-pointer hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {leading && <div className="shrink-0">{leading}</div>}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0 pr-8">
            <p className="font-semibold text-[15px] truncate leading-tight">{title}</p>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground truncate mt-1">{subtitle}</p>}
          {meta && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{meta}</p>}
        </div>

        {actions && (
          <div
            className="absolute right-2 top-2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {(value || hint) && (
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border/60 pt-3">
          {hint ? <p className="text-[11px] text-muted-foreground truncate">{hint}</p> : <span />}
          {value && <p className="text-base font-bold leading-none tabular-nums">{value}</p>}
        </div>
      )}
    </div>
  );
}

/** Pastille ronde (icône ou image) utilisée en tête de carte. */
export function ListAvatar({
  src,
  alt,
  icon,
  tone = "muted",
  className,
}: {
  src?: string | null;
  alt?: string;
  icon?: ReactNode;
  tone?: "muted" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden", tones[tone], className)}>
      {src ? <img src={src} alt={alt || ""} loading="lazy" className="h-full w-full object-cover" /> : icon}
    </div>
  );
}

/** Badge de statut minimaliste. */
export function ListBadge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight", className)}>
      {children}
    </span>
  );
}

/** État vide homogène pour toutes les vues. */
export function ListEmpty({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card py-14 px-6 text-center">
      {icon && <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>}
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
