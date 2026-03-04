import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Package, Scan, ShoppingCart, Receipt, Menu, Store, ShoppingBag, ClipboardList, Star, User, Settings, LogOut, TrendingUp, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks" },
  { name: "Caisse", href: "/app/caisse", icon: Scan, label: "Caisse" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes" },
  { name: "Facturation", href: "/app/facturation", icon: Receipt, label: "Factures" },
];

const drawerNavigation = [
  { section: "Navigation", items: [
    { name: "Tableau de bord", href: "/app", icon: BarChart3 },
    { name: "Gestion des stocks", href: "/app/stocks", icon: Package },
    { name: "Caisse", href: "/app/caisse", icon: Scan },
    { name: "Suivi des ventes", href: "/app/ventes", icon: ShoppingCart },
    { name: "Facturation", href: "/app/facturation", icon: Receipt },
    { name: "Performance & Rapports", href: "/app/performance", icon: TrendingUp },
  ]},
  { section: "Boutique en ligne", items: [
    { name: "Ma Boutique", href: "/app/boutique/config", icon: Store },
    { name: "Produits en ligne", href: "/app/boutique/produits", icon: ShoppingBag },
    { name: "Commandes reçues", href: "/app/boutique/commandes", icon: ClipboardList },
    { name: "Avis clients", href: "/app/boutique/avis", icon: Star },
  ]},
  { section: "Compte", items: [
    { name: "Profil", href: "/app/profile", icon: User },
    { name: "Paramètres", href: "/app/settings", icon: Settings },
  ]},
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setDrawerOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 min-w-0 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className={`text-[10px] truncate ${active ? "font-semibold" : "font-normal"}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
          {/* Menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 min-w-0 text-muted-foreground"
          >
            <Menu className="h-5 w-5 stroke-2" />
            <span className="text-[10px] font-normal">Menu</span>
          </button>
        </div>
      </nav>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-1.5 rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8 space-y-6">
            {drawerNavigation.map((section) => (
              <div key={section.section}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {section.section}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Logout */}
            <button
              onClick={() => { signOut(); setDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              Déconnexion
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
