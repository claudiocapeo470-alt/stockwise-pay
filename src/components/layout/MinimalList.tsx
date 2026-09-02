import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Conteneur de contenu : **liste fluide** sans blocs.
 * Les lignes sont séparées par un filet fin, pleine largeur.
 */
export function ListShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="list" className={cn("divide-y divide-border/60", className)}>
      {children}
    </div>
  );
}

/**
 * Ligne d'entité épurée (mobile, tablette et desktop).
 * - leading : avatar / image / icône ronde
 * - title + badge, subtitle / meta en dessous
 * - value + hint alignés à droite
 * - actions : menu ou boutons, à l'extrémité droite
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
        "group flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-1 sm:px-2 -mx-1 sm:-mx-2 rounded-xl transition-colors",
        onClick &&
          "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-medium text-[15px] truncate leading-tight">{title}</p>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
        {meta && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{meta}</p>}
      </div>

      {(value || hint) && (
        <div className="shrink-0 text-right">
          {value && <p className="text-[15px] font-semibold leading-tight tabular-nums">{value}</p>}
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      )}

      {actions && (
        <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {actions}
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
