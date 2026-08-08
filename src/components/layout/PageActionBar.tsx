import { ReactNode, useState } from "react";
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
  const [searchOpen, setSearchOpen] = useState(false);
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

  return (
    <div className={className}>
      {segments && (
        <div className="flex items-center gap-2 [&>*]:flex-1 [&_button]:w-full [&_button]:h-11 [&_button]:rounded-xl [&_button]:border [&_button]:border-border [&_button]:bg-card [&_button]:shadow-soft [&_button]:text-[13px] [&_button]:font-semibold [&_button]:text-foreground [&_button:hover]:bg-muted [&_button]:px-2 [&_svg]:text-accent">
          {segments}
        </div>
      )}

      {hasSearch && searchOpen && (
        <div className="relative mt-3 animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={searchValue}
            onChange={(e) => onSearchChange!(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 pr-10 h-11 rounded-full"
          />
          <button
            type="button"
            aria-label="Fermer la recherche"
            onClick={() => { onSearchChange!(""); setSearchOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions flottantes : position identique sur toutes les pages, au-dessus de la barre de navigation */}
      <div
        className="fixed right-4 z-40 flex flex-col items-end gap-3"
        style={{ bottom: "calc(84px + env(safe-area-inset-bottom))" }}
      >
        {hasSearch && (
          <button
            type="button"
            aria-label="Rechercher"
            onClick={() => setSearchOpen((v) => !v)}
            className="h-12 w-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground active:scale-95 transition-transform"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        )}
        {primary && (
          <div className="[&_button]:h-14 [&_button]:w-14 [&_button]:rounded-full [&_button]:p-0 [&_button]:shadow-lg [&_button]:gap-0 [&_span]:hidden [&_div]:hidden [&_svg]:h-6 [&_svg]:w-6">
            {primary}
          </div>
        )}
      </div>
    </div>
  );
}

