import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Package, Scan, ShoppingCart, Receipt, Menu, Store, ShoppingBag, ClipboardList, Star, User, Settings, LogOut, TrendingUp, X, Users, Truck, FileText, FileCheck, CreditCard } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  label?: string;
  permission?: string;
}

const allBottomNav: NavItem[] = [
  { name: "Dashboard", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock" },
  { name: "Caisse", href: "/app/caisse", icon: Scan, label: "Caisse", permission: "pos" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales" },
];

const allDrawerNavigation = [
  { section: "PRINCIPAL", items: [
    { name: "Tableau de bord", href: "/app", icon: BarChart3 },
  ]},
  { section: "MAGASIN", items: [
    { name: "Gestion des stocks", href: "/app/stocks", icon: Package, permission: "stock" },
    { name: "Caisse", href: "/app/caisse", icon: Scan, permission: "pos" },
    { name: "Suivi des ventes", href: "/app/ventes", icon: ShoppingCart, permission: "sales" },
  ]},
  { section: "FACTURATION", items: [
    { name: "Factures", href: "/app/factures", icon: FileText, permission: "sales" },
    { name: "Devis", href: "/app/devis", icon: FileCheck, permission: "sales" },
    { name: "Paiements", href: "/app/paiements", icon: CreditCard, permission: "sales" },
  ]},
  { section: "BOUTIQUE EN LIGNE", items: [
    { name: "Ma Boutique", href: "/app/boutique/config", icon: Store, permission: "boutique" },
    { name: "Produits en ligne", href: "/app/boutique/produits", icon: ShoppingBag, permission: "boutique" },
    { name: "Commandes reçues", href: "/app/boutique/commandes", icon: ClipboardList, permission: "boutique_orders" },
    { name: "Avis clients", href: "/app/boutique/avis", icon: Star, permission: "boutique" },
  ]},
  { section: "LIVRAISONS", items: [
    { name: "Livraisons", href: "/app/livraisons", icon: Truck, permission: "deliveries" },
  ]},
  { section: "ANALYTIQUE", items: [
    { name: "Performance", href: "/app/performance", icon: TrendingUp, permission: "reports" },
    { name: "Rapports", href: "/app/rapports", icon: FileText, permission: "reports" },
  ]},
  { section: "ÉQUIPE & COMPTE", items: [
    { name: "Mon équipe", href: "/app/team", icon: Users, permission: "settings" },
    { name: "Profil", href: "/app/profile", icon: User },
    { name: "Paramètres", href: "/app/settings", icon: Settings },
  ]},
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isEmployee, hasPermission } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterItems = (items: NavItem[]) => {
    if (!isEmployee) return items;
    return items.filter(item => !item.permission || hasPermission(item.permission));
  };

  const navigation = filterItems(allBottomNav).slice(0, 4);

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
                  {item.label || item.name}
                </span>
              </NavLink>
            );
          })}
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
            {allDrawerNavigation.map((section) => {
              const items = filterItems(section.items);
              if (items.length === 0) return null;
              return (
                <div key={section.section}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    {section.section}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
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
              );
            })}
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
