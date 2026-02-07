import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Package, Scan, ShoppingCart, Receipt, TrendingUp } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks" },
  { name: "Caisse", href: "/app/caisse", icon: Scan, label: "Caisse" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes" },
  { name: "Facturation", href: "/app/facturation", icon: Receipt, label: "Factures" },
  { name: "Performance", href: "/app/performance", icon: TrendingUp, label: "Perfs" },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 min-w-0 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-2"}`}
              />
              <span className={`text-[10px] truncate ${active ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
