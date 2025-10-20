import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, Receipt, TrendingUp } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes" },
  { name: "Facturation", href: "/app/facturation", icon: Receipt, label: "Factures" },
  { name: "Performance", href: "/app/performance", icon: TrendingUp, label: "Perf." },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-transform duration-200 ${
                  active ? "scale-110" : "scale-100"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    active ? "stroke-[2.5]" : "stroke-2"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  active ? "font-semibold" : "font-normal"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full transition-all duration-300" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
