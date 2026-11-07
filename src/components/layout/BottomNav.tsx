import { useState, useEffect } from "react";
import { Drawer as Vaul } from "vaul";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Package, Scan, ShoppingCart, Menu, Store, ShoppingBag, ClipboardList, Star, User, Settings, LogOut, TrendingUp, X, Users, Truck, FileText, FileCheck, CreditCard } from "lucide-react";
import { DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyModules, type ModuleKey } from "@/hooks/useCompanyModules";
import { getPerms, isFullAccess, isDriverOnly, canPos, canStock, canOrders } from "@/lib/rolePermissions";
import { LogoutButton } from "@/components/layout/LogoutButton";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  label?: string;
  permission?: string;
  module?: ModuleKey;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const getRouteModule = (href: string): ModuleKey | undefined => {
  if (["/app/caisse", "/app/ventes", "/app/paiements"].some((route) => href.startsWith(route))) return "pos";
  if (["/app/stocks", "/app/factures", "/app/devis", "/app/livraisons"].some((route) => href.startsWith(route))) return "stock";
  if (href.startsWith("/app/boutique")) return "boutique";
  return undefined;
};

const allBottomNav: NavItem[] = [
  { name: "Dashboard", href: "/app", icon: Home, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Caisse", href: "/app/caisse", icon: Scan, label: "Caisse", permission: "pos", module: "pos" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales", module: "pos" },
];

const allDrawerNavigation: NavSection[] = [
  { section: "PRINCIPAL", items: [
    { name: "Tableau de bord", href: "/app", icon: Home },
  ]},
  { section: "MAGASIN", items: [
    { name: "Gestion des stocks", href: "/app/stocks", icon: Package, permission: "stock", module: "stock" },
    { name: "Caisse", href: "/app/caisse", icon: Scan, permission: "pos", module: "pos" },
    { name: "Suivi des ventes", href: "/app/ventes", icon: ShoppingCart, permission: "sales", module: "pos" },
  ]},
  { section: "FACTURATION", items: [
    { name: "Factures", href: "/app/factures", icon: FileText, permission: "sales", module: "stock" },
    { name: "Devis", href: "/app/devis", icon: FileCheck, permission: "sales", module: "stock" },
    { name: "Paiements", href: "/app/paiements", icon: CreditCard, permission: "sales", module: "pos" },
  ]},
  { section: "BOUTIQUE EN LIGNE", items: [
    { name: "Ma Boutique", href: "/app/boutique/config", icon: Store, permission: "boutique", module: "boutique" },
    { name: "Produits en ligne", href: "/app/boutique/produits", icon: ShoppingBag, permission: "boutique", module: "boutique" },
    { name: "Commandes reçues", href: "/app/boutique/commandes", icon: ClipboardList, permission: "boutique_orders", module: "boutique" },
    { name: "Avis clients", href: "/app/boutique/avis", icon: Star, permission: "boutique", module: "boutique" },
  ]},
  { section: "CLIENTS", items: [
    { name: "Clients", href: "/app/clients", icon: Users, permission: "customers" },
  ]},
  { section: "LIVRAISONS", items: [
    { name: "Livraisons", href: "/app/livraisons", icon: Truck, permission: "deliveries", module: "stock" },
  ]},
  { section: "ANALYTIQUE", items: [
    { name: "Performance", href: "/app/performance", icon: TrendingUp, permission: "reports" },
    { name: "Rapports", href: "/app/rapports", icon: FileText, permission: "reports" },
    { name: "Rapport Employés", href: "/app/rapport-employes", icon: Users, permission: "reports" },
  ]},
  { section: "ÉQUIPE & COMPTE", items: [
    { name: "Mon équipe", href: "/app/team", icon: Users, permission: "settings" },
    { name: "Paramètres", href: "/app/settings", icon: Settings },
  ]},
];

const livreurNav: NavItem[] = [
  { name: "Livraisons", href: "/app/livreur", icon: Truck, label: "Livraisons" },
  { name: "Réglages", href: "/app/settings", icon: Settings, label: "Réglages" },
];

const stockManagerNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Réglages", href: "/app/settings", icon: Settings, label: "Réglages" },
];

const commandesNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Commandes", href: "/app/boutique/commandes", icon: ClipboardList, label: "Commandes", permission: "boutique_orders", module: "boutique" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Réglages", href: "/app/settings", icon: Settings, label: "Réglages" },
];

const managerNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales", module: "pos" },
  { name: "Stats", href: "/app/performance", icon: TrendingUp, label: "Stats", permission: "reports" },
  { name: "Réglages", href: "/app/settings", icon: Settings, label: "Réglages" },
];

const fusionneNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Boutique", href: "/app/boutique/commandes", icon: Store, label: "Boutique", permission: "boutique_orders", module: "boutique" },
  { name: "Réglages", href: "/app/settings", icon: Settings, label: "Réglages" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEmployee, hasPermission, memberInfo } = useAuth();
  const { hasModule } = useCompanyModules();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const perms = getPerms(memberInfo);

  // Caissier (permission pos sans accès complet) : navigation dédiée gérée par Caisse.tsx
  if (isEmployee && canPos(perms) && !isFullAccess(perms) && !canStock(perms) && !canOrders(perms)) return null;

  const hasAccess = (item: NavItem) => {
    const itemModule = item.module || getRouteModule(item.href);
    if (itemModule && !hasModule(itemModule)) return false;
    if (item.href === '/app/rapport-employes' && isEmployee && !isFullAccess(perms) && !hasPermission('reports')) return false;
    if (item.permission && isEmployee && !hasPermission(item.permission)) return false;
    return true;
  };

  const filterItems = (items: NavItem[]) => items.filter(hasAccess);

  let navigation: NavItem[];
  let showMenuButton = true;

  if (isEmployee && isDriverOnly(perms)) {
    navigation = livreurNav;
    showMenuButton = false;
  } else if (isEmployee && isFullAccess(perms)) {
    navigation = filterItems(managerNav);
  } else if (isEmployee && canStock(perms) && canOrders(perms)) {
    navigation = filterItems(fusionneNav);
  } else if (isEmployee && canOrders(perms)) {
    navigation = filterItems(commandesNav);
  } else if (isEmployee && canStock(perms)) {
    navigation = filterItems(stockManagerNav);
  } else {
    navigation = filterItems(allBottomNav).slice(0, 4);
  }

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Ouverture par glissement depuis le bord gauche
  useEffect(() => {
    if (!showMenuButton) return;
    let sx = 0, sy = 0, tracking = false;
    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      tracking = t.clientX < 24;
      sx = t.clientX; sy = t.clientY;
    };
    const move = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
      if (dy > 30 && dy > dx) { tracking = false; return; }
      if (dx > 60) { tracking = false; setDrawerOpen(true); }
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
    };
  }, [showMenuButton]);

  const handleNavClick = (href: string) => {
    navigate(href);
    setDrawerOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 lg:hidden pb-safe backdrop-blur-xl">
        <div className="flex items-start justify-around h-[84px] px-2 pt-2">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center flex-1 gap-1 min-w-0 min-h-[44px] transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className={`flex h-7 w-10 items-center justify-center rounded-full transition-all duration-200 ${active ? "bg-primary/10" : ""}`}>
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                </span>
                <span className={`text-[11px] leading-none truncate max-w-[64px] ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label || item.name}
                </span>
              </NavLink>
            );
          })}
          {showMenuButton && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center flex-1 gap-1 min-w-0 min-h-[44px] text-muted-foreground"
            >
              <span className="flex h-7 w-10 items-center justify-center rounded-full">
                <Menu className="h-5 w-5 flex-shrink-0 stroke-[1.8]" />
              </span>
              <span className="text-[11px] leading-none font-medium">Menu</span>
            </button>
          )}
        </div>
      </nav>



      <Vaul.Root direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-[60] bg-black/60" />
        <Vaul.Content className="fixed inset-y-0 left-0 z-[60] flex w-[86vw] max-w-[360px] flex-col bg-background border-r border-border rounded-r-3xl outline-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" aria-describedby={undefined}>
          <DrawerHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-2 text-left">
            <DrawerTitle className="text-2xl font-bold tracking-tight">Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 space-y-6">
            {allDrawerNavigation.map((section) => {
              const items = filterItems(section.items);
              if (items.length === 0) return null;
              return (
                <div key={section.section}>
                  <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.12em] mb-1">
                    {section.section}
                  </p>
                  <div>
                    {items.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`w-full flex items-center gap-3.5 py-3 min-h-[48px] text-[15px] text-left transition-colors ${
                          isActive(item.href)
                            ? "text-accent font-semibold"
                            : "text-foreground/90 active:text-accent"
                        }`}
                      >
                        <item.icon className={`h-[22px] w-[22px] flex-shrink-0 ${isActive(item.href) ? "stroke-[2.4]" : "stroke-[1.75]"}`} />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <LogoutButton onConfirmed={() => setDrawerOpen(false)} />
          </div>
        </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </>
  );
}