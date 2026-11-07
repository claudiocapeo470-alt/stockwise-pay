import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProductArt } from "@/components/ui/ProductArt";
import { Button } from "@/components/ui/button";

export const fmtNum = (n: number) => Math.round(n || 0).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
export const fmtFcfa = (n: number) => `${fmtNum(n)} FCFA`;

export const rise = (i: number) => ({ animationDelay: `${i * 60}ms` });

/** Carte de base du tableau de bord */
export function DashCard({ title, action, children, className, index = 0 }: { title?: string; action?: ReactNode; children: ReactNode; className?: string; index?: number }) {
  return (
    <section style={rise(index)} className={cn("card-lift animate-rise rounded-2xl border border-border bg-card p-4 sm:p-5 min-w-0", className)}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <ProductArt art="box" size={56} />
      <p className="text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} className="rounded-xl">{actionLabel}</Button>
      )}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl bg-muted/60 animate-pulse", className)} />;
}

/** Couleur du mode de paiement (classes sémantiques) */
export function paymentInfo(method?: string | null): { label: string; dot: string } {
  const m = (method || "").toLowerCase();
  if (m.includes("wave")) return { label: "Wave", dot: "bg-accent" };
  if (m.includes("orange")) return { label: "Orange Money", dot: "bg-warning" };
  if (m.includes("mtn") || m.includes("momo")) return { label: "MTN MoMo", dot: "bg-warning/50" };
  if (m.includes("cash") || m.includes("esp")) return { label: "Espèces", dot: "bg-success" };
  if (m.includes("card") || m.includes("carte")) return { label: "Carte", dot: "bg-primary" };
  if (m.includes("credit") || m.includes("crédit")) return { label: "Crédit", dot: "bg-destructive" };
  if (!m) return { label: "Espèces", dot: "bg-success" };
  return { label: method!.charAt(0).toUpperCase() + method!.slice(1).replace(/_/g, " "), dot: "bg-muted-foreground" };
}

/** Courbe principale (SVG) */
export function AreaChart({ values, labels, height = 180 }: { values: number[]; labels: string[]; height?: number }) {
  const w = 600, h = height, pad = 10;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2 - 10)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]} ${h} L${pts[0][0]} ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <div className="w-full">
      <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Évolution du chiffre d'affaires">
        <defs>
          <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="hsl(var(--border))" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#dash-area)" className="animate-fade-in" />
        <path d={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" className="animate-draw" vectorEffect="non-scaling-stroke" />
      </svg>
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-primary bg-card animate-fade-in"
          style={{ left: `${(last[0] / w) * 100}%`, top: last[1] }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

/** Ligne de liste avec barre animée */
export function BarRow({ name, imageUrl, category, right, pct, color = "bg-primary" }: { name: string; imageUrl?: string | null; category?: string | null; right: string; pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <ProductArt name={name} imageUrl={imageUrl} category={category || undefined} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{right}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full origin-left rounded-full animate-grow", color)} style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
        </div>
      </div>
    </div>
  );
}
