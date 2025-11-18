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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/admin"}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors w-full
              ${isActive ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
