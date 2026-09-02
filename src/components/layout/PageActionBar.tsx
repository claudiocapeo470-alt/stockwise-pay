import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageActionBarProps {
  /** Valeur du champ de recherche */
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Actions secondaires (boutons / déclencheurs de dialogues) : pilule segmentée sur mobile */
  segments?: ReactNode;
  /** Action principale (bouton ou déclencheur de dialogue) : FAB sur mobile */
  primary?: ReactNode;
  className?: string;
}

/**
 * Barre d'actions unifiée pour toutes les pages listes.
 * - Mobile : pilule segmentée pour les actions secondaires + FAB (recherche au-dessus de l'ajout).
 * - Desktop / tablette : recherche à gauche, actions alignées à droite (aucun élément flottant).
 */
export function PageActionBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  segments,
  primary,
  className,
}: PageActionBarProps) {
  const isMobile = useIsMobile();
  const hasSearch = typeof searchValue === "string" && !!onSearchChange;

  if (!isMobile) {
    return (
      <div className={cn("flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between", className)}>
        {hasSearch ? (
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange!(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 flex-wrap lg:justify-end">
          {segments}
          {primary}
        </div>
      </div>
    );
  }

  // Mobile / tablette : boutons flottants (recherche au-dessus, ajout en dessous) au-dessus de la barre de navigation
  return (
    <div className={cn(className)}>
      {segments && <SegmentRow>{segments}</SegmentRow>}

      {hasSearch && searchOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(var(--fab-nav-h)+1rem)]">
          <div className="relative rounded-2xl bg-card shadow-lg border border-border">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchValue}
              onChange={(e) => onSearchChange!(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-10 h-12 rounded-2xl border-0 bg-transparent"
            />
            <button
              type="button"
              aria-label="Fermer la recherche"
              onClick={() => { onSearchChange!(""); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed right-4 bottom-[calc(var(--fab-nav-h)+0.75rem)] z-40 flex flex-col items-end gap-2.5">
        {hasSearch && !searchOpen && (
          <button
            type="button"
            aria-label="Rechercher"
            onClick={() => setSearchOpen(true)}
            className="h-11 w-11 rounded-full bg-card border border-border text-foreground shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        )}
        {primary && (
          <div className="[&_button]:h-14 [&_button]:w-14 [&_button]:rounded-full [&_button]:p-0 [&_button]:gap-0 [&_button_span]:hidden [&_button_div]:hidden [&_button]:shadow-xl [&_svg]:h-6 [&_svg]:w-6">
            {primary}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Rangée d'actions secondaires (même style que les segments de PageActionBar),
 * utilisable seule pour les placer sous les blocs KPI.
 */
export function SegmentRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 [&>*]:flex-1 [&_button]:w-full [&_button]:h-10 [&_button]:rounded-xl [&_button]:border [&_button]:border-border [&_button]:bg-card [&_button]:text-[13px] [&_button]:font-semibold [&_button]:text-foreground [&_button:hover]:bg-muted [&_button]:px-2 [&_svg]:text-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}


