import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Package, Scan, ShoppingCart, Menu, Store, ShoppingBag, ClipboardList, Star, User, Settings, LogOut, TrendingUp, X, Users, Truck, FileText, FileCheck, CreditCard } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyModules, type ModuleKey } from "@/hooks/useCompanyModules";

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
    { name: "Profil", href: "/app/profile", icon: User },
    { name: "Paramètres", href: "/app/settings", icon: Settings },
  ]},
];

const livreurNav: NavItem[] = [
  { name: "Livraisons", href: "/app/livreur", icon: Truck, label: "Livraisons" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const stockManagerNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const commandesNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Commandes", href: "/app/boutique/commandes", icon: ClipboardList, label: "Commandes", permission: "boutique_orders", module: "boutique" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const managerNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales", module: "pos" },
  { name: "Stats", href: "/app/performance", icon: TrendingUp, label: "Stats", permission: "reports" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const fusionneNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: Home, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Boutique", href: "/app/boutique/commandes", icon: Store, label: "Boutique", permission: "boutique_orders", module: "boutique" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isEmployee, hasPermission, memberInfo } = useAuth();
  const { hasModule } = useCompanyModules();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = (memberInfo?.member_role_name || '').toLowerCase();

  if (isEmployee && role.includes('caissier')) return null;

  const hasAccess = (item: NavItem) => {
    const itemModule = item.module || getRouteModule(item.href);
    if (itemModule && !hasModule(itemModule)) return false;
    if (item.href === '/app/rapport-employes' && isEmployee && !role.includes('manager')) return false;
    if (item.permission && isEmployee && !hasPermission(item.permission)) return false;
    return true;
  };

  const filterItems = (items: NavItem[]) => items.filter(hasAccess);

  let navigation: NavItem[];
  let showMenuButton = true;

  if (isEmployee && role.includes('livreur')) {
    navigation = livreurNav;
    showMenuButton = false;
  } else if (isEmployee && role.includes('manager')) {
    navigation = filterItems(managerNav);
  } else if (isEmployee && (role.includes('fusionn') || role.includes('fusionne'))) {
    navigation = filterItems(fusionneNav);
  } else if (isEmployee && role.includes('commande')) {
    navigation = filterItems(commandesNav);
  } else if (isEmployee && role.includes('stock')) {
    navigation = filterItems(stockManagerNav);
  } else {
    navigation = filterItems(allBottomNav).slice(0, 4);
  }

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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 md:hidden pb-safe backdrop-blur-xl">
        <div className="flex items-end justify-around h-[68px] px-2 pb-2">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 gap-1.5 pt-2 transition-colors duration-200 min-w-0 min-h-[44px] ${
                  active ? "text-foreground" : "text-muted-foreground/70"
                }`}
              >
                <item.icon className={`h-[22px] w-[22px] flex-shrink-0 ${active ? "stroke-[2.4]" : "stroke-[1.75]"}`} />
                <span className={`text-[11px] leading-none truncate max-w-[64px] ${active ? "font-semibold" : "font-normal"}`}>
                  {item.label || item.name}
                </span>
              </NavLink>
            );
          })}
          {showMenuButton && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center justify-center flex-1 gap-1.5 pt-2 transition-colors duration-200 min-w-0 min-h-[44px] text-muted-foreground/70"
            >
              <Menu className="h-[22px] w-[22px] flex-shrink-0 stroke-[1.75]" />
              <span className="text-[11px] leading-none font-normal">Menu</span>
            </button>
          )}
        </div>
      </nav>



      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh] border-0">
          <DrawerHeader className="flex items-center justify-between px-5 pb-2">
            <DrawerTitle className="text-2xl font-bold tracking-tight">Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-8 space-y-6">
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-[15px] font-semibold text-destructive bg-destructive/10 active:bg-destructive/20 transition-colors">
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  Déconnexion
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[320px] rounded-3xl p-6 text-center border-0">
                <AlertDialogHeader className="items-center space-y-3">
                  <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <LogOut className="h-6 w-6 text-destructive" />
                  </div>
                  <AlertDialogTitle className="text-lg font-bold">Se déconnecter ?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground">
                    Toute vente en cours à la caisse sera perdue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0 mt-4">
                  <AlertDialogAction
                    className="w-full h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { signOut(); setDrawerOpen(false); }}
                  >
                    Se déconnecter
                  </AlertDialogAction>
                  <AlertDialogCancel className="w-full h-11 rounded-xl mt-0">Annuler</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}