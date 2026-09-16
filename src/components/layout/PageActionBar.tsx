import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
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

  const headerActionTarget = typeof document !== "undefined"
    ? document.getElementById("mobile-page-primary-action")
    : null;

  // Mobile : recherche pleine largeur sous le titre et action principale dans l'en-tête.
  return (
    <div className={cn("space-y-3", className)}>
      {segments && <SegmentRow>{segments}</SegmentRow>}

      {hasSearch && (
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-12 w-full rounded-full border-0 bg-muted/80 pl-12 pr-4 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      )}

      {primary && headerActionTarget && createPortal(
        <div className="[&_button]:h-10 [&_button]:w-10 [&_button]:rounded-full [&_button]:p-0 [&_button]:gap-0 [&_button_span]:hidden [&_button_div]:hidden [&_button]:shadow-none [&_svg]:h-5 [&_svg]:w-5">
          {primary}
        </div>,
        headerActionTarget,
      )}
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


