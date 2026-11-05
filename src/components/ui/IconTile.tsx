import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* Module tone palette (fixed brand artwork colors). */
export const TONES = {
  blue: { fg: "#2447E8", bg: "#EAEFFF" },
  orange: { fg: "#C2410C", bg: "#FFEDD5" },
  green: { fg: "#0B7A4F", bg: "#DCF5E9" },
  violet: { fg: "#6D28D9", bg: "#EDE9FE" },
  cyan: { fg: "#0E7490", bg: "#DDF4F9" },
  pink: { fg: "#BE185D", bg: "#FCE7F3" },
  amber: { fg: "#A8590A", bg: "#FEF3C7" },
  red: { fg: "#B42318", bg: "#FDECEA" },
} as const;

export type Tone = keyof typeof TONES;

type Props = {
  icon: LucideIcon;
  tone?: Tone;
  size?: number;
  active?: boolean;
  className?: string;
};

export function IconTile({ icon: Icon, tone = "blue", size = 36, active, className }: Props) {
  const t = TONES[tone];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-xl transition-colors", className)}
      style={{ width: size, height: size, background: active ? t.fg : t.bg }}
    >
      <Icon strokeWidth={2} style={{ width: size * 0.55, height: size * 0.55, color: active ? "#FFFFFF" : t.fg }} />
    </span>
  );
}

export default IconTile;
