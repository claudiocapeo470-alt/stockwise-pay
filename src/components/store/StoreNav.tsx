import { NavLink } from "react-router-dom";
import { Store, Package, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/boutique/config", label: "Ma Boutique", icon: Store },
  { to: "/boutique/produits", label: "Produits", icon: Package },
  { to: "/boutique/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/boutique/avis", label: "Avis", icon: Star },
];

export function StoreNav() {
  return (
    <nav
      aria-label="Pages de la boutique"
      className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-muted/50 border border-border rounded-full max-w-full"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
              isActive
                ? "bg-background text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default StoreNav;
