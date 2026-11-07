import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Package, Bell, TrendingUp } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, label: "Admin" },
  { name: "Utilisateurs", href: "/admin/users", icon: Users, label: "Users" },
  { name: "Abonnements", href: "/admin/subscriptions", icon: CreditCard, label: "Abon." },
  { name: "Stocks", href: "/admin/stocks", icon: Package, label: "Stock" },
  { name: "Notifications", href: "/admin/notifications", icon: Bell, label: "Notif" },
  { name: "Performance", href: "/admin/performance", icon: TrendingUp, label: "Stats" },
];

export function AdminBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur-xl pb-safe">
      <div className="flex justify-around items-start h-[84px] px-2 pt-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/admin"}
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 min-w-0 min-h-[44px] transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-7 w-10 items-center justify-center rounded-full transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                </span>
                <span className={`text-[11px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
