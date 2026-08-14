import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/** Conteneur standard d'une page : rythme vertical cohérent partout. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-5 animate-fade-in", className)}>{children}</div>;
}

/**
 * Barre d'en-tête : sous-titre à gauche, actions à droite.
 * Toujours empilée sur mobile, alignée sur une ligne à partir de sm.
 */
export function PageToolbar({
  subtitle,
  children,
  className,
}: {
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", className)}>
      {subtitle ? (
        <p className="text-sm text-muted-foreground leading-snug">{subtitle}</p>
      ) : (
        <div className="hidden sm:block" />
      )}
      {children && <div className="flex items-center gap-2 flex-wrap sm:justify-end">{children}</div>}
    </div>
  );
}

/** Grille de statistiques homogène (2 colonnes mobile, 3/4 desktop). */
export function StatGrid({ children, cols = 3, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  const map = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  } as const;
  return <div className={cn("grid gap-2 sm:gap-4", map[cols], className)}>{children}</div>;
}

/**
 * Titre de section aligné à gauche, placé juste au-dessus d'une liste / grille de cartes.
 * Sépare visuellement le contenu du haut (KPI, filtres) des détails en dessous.
 */
export function SectionHeading({
  title,
  count,
  action,
  centered = false,
  className,
}: {
  title: string;
  count?: number;
  /** @deprecated les textes d'indication ont été retirés de l'UI */
  description?: ReactNode;
  action?: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-10 sm:mt-14 mb-4 flex items-center gap-3",
        centered ? "justify-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0 flex items-center gap-2", centered && "justify-center")}>
        <h2 className="text-[15px] sm:text-base font-semibold tracking-tight leading-none truncate">{title}</h2>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground leading-none">
            {count}
          </span>
        )}
      </div>
      {action && !centered && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}


type Tone = "primary" | "success" | "warning" | "destructive" | "accent";

const TONES: Record<Tone, { bg: string; fg: string; ring: string }> = {
  primary: { bg: "bg-primary/10", fg: "text-primary", ring: "border-border/60" },
  success: { bg: "bg-success/10", fg: "text-success", ring: "border-success/30" },
  warning: { bg: "bg-warning/10", fg: "text-warning", ring: "border-warning/30" },
  destructive: { bg: "bg-destructive/10", fg: "text-destructive", ring: "border-destructive/30" },
  accent: { bg: "bg-accent/10", fg: "text-accent-foreground", ring: "border-border/60" },
};

/** Carte KPI unique utilisée dans toutes les pages. */
export function StatCard({
  icon: Icon,
  value,
  label,
  tone = "primary",
  highlight = false,
  className,
}: {
  icon?: LucideIcon;
  value: ReactNode;
  label: string;
  tone?: Tone;
  highlight?: boolean;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <Card className={cn("border-border/60", highlight && t.ring, className)}>
      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {Icon && (
          <div className={cn("h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0", t.bg)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", t.fg)} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold leading-none truncate">{value}</p>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
