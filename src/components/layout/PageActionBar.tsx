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

  // Mobile : recherche pleine largeur + bouton d'ajout compact à droite (style SaaS classique)
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {hasSearch && (
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange!(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-8 h-11 rounded-xl bg-card"
            />
            {searchValue && (
              <button
                type="button"
                aria-label="Effacer"
                onClick={() => onSearchChange!("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {primary && (
          <div className="shrink-0 [&_button]:h-11 [&_button]:w-11 [&_button]:rounded-xl [&_button]:p-0 [&_button]:gap-0 [&_button_span]:hidden [&_button]:shadow-sm [&_svg]:h-5 [&_svg]:w-5">
            {primary}
          </div>
        )}
      </div>

      {segments && (
        <div className="flex items-center gap-2 [&>*]:flex-1 [&_button]:w-full [&_button]:h-10 [&_button]:rounded-xl [&_button]:border [&_button]:border-border [&_button]:bg-card [&_button]:text-[13px] [&_button]:font-semibold [&_button]:text-foreground [&_button:hover]:bg-muted [&_button]:px-2 [&_svg]:text-accent">
          {segments}
        </div>
      )}
    </div>
  );
}

