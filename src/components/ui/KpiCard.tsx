import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile, type Tone } from "./IconTile";

type Props = {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  tone?: Tone;
  /** variation, ex. "+12 %" */
  delta?: string;
  deltaTone?: "up" | "down" | "warn";
  /** valeurs pour la mini courbe */
  trend?: number[];
  hero?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function sparkPath(values: number[], w = 72, h = 26) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  return values
    .map((v, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)} ${(h - 2 - ((v - min) / range) * (h - 4)).toFixed(1)}`)
    .join(" ");
}

const DELTA = {
  up: "bg-success/10 text-success",
  down: "bg-destructive/10 text-destructive",
  warn: "bg-warning/10 text-warning",
};

export function KpiCard({ title, value, unit, icon, tone = "blue", delta, deltaTone = "up", trend, hero, className, style }: Props) {
  const d = trend ? sparkPath(trend) : "";
  return (
    <div
      style={style}
      className={cn(
        "rounded-2xl p-4 animate-rise",
        hero ? "bg-brand-gradient text-primary-foreground" : "card-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-[13px] font-medium", hero ? "text-primary-foreground/80" : "text-muted-foreground")}>{title}</p>
        {hero ? (
          <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            {(() => { const I = icon; return <I className="h-4 w-4" strokeWidth={2} />; })()}
          </span>
        ) : (
          <IconTile icon={icon} tone={tone} size={30} />
        )}
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tabular-nums tracking-tight">
        {value}
        {unit && <span className={cn("ml-1 text-[13px] font-medium", hero ? "text-primary-foreground/80" : "text-muted-foreground")}>{unit}</span>}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        {delta ? (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", hero ? "bg-primary-foreground/15 text-primary-foreground" : DELTA[deltaTone])}>
            {delta}
          </span>
        ) : <span />}
        {d && (
          <svg width={72} height={26} viewBox="0 0 72 26" fill="none" aria-hidden="true" className={hero ? "text-primary-foreground" : "text-primary"}>
            <path d={d} pathLength={1} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="draw-line animate-draw" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default KpiCard;
