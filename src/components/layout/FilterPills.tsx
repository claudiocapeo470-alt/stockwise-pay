import { cn } from "@/lib/utils";

export interface FilterPill {
  key: string;
  label: string;
  count?: number;
}

/**
 * Sélecteur de filtres minimaliste, centré, style segmenté (app mobile).
 * Défile horizontalement sur petits écrans sans casser la mise en page.
 */
export function FilterPills({
  filters,
  value,
  onChange,
  className,
}: {
  filters: FilterPill[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-start sm:justify-center", className)}>
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center gap-2.5 py-1 pr-3">
          {filters.map((f) => {
            const active = value === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange(f.key)}
                className={cn(
                  "shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all sm:px-4 sm:py-2",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/70 text-foreground hover:bg-foreground/5",
                )}
              >
                {f.label}
                {f.count !== undefined && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
