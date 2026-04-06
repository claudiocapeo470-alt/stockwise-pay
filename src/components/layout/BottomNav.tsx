import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Package, Scan, ShoppingCart, Menu, Store, ShoppingBag, ClipboardList, Star, User, Settings, LogOut, TrendingUp, X, Users, Truck, FileText, FileCheck, CreditCard } from "lucide-react";
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

const getRouteModule = (href: string): ModuleKey | undefined => {
  if (["/app/caisse", "/app/ventes", "/app/paiements"].some((route) => href.startsWith(route))) return "pos";
  if (["/app/stocks", "/app/factures", "/app/devis", "/app/livraisons"].some((route) => href.startsWith(route))) return "stock";
  if (href.startsWith("/app/boutique")) return "boutique";
  return undefined;
};

const allBottomNav: NavItem[] = [
  { name: "Dashboard", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Caisse", href: "/app/caisse", icon: Scan, label: "Caisse", permission: "pos", module: "pos" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales", module: "pos" },
];

const allDrawerNavigation: NavSection[] = [
  { section: "PRINCIPAL", items: [
    { name: "Tableau de bord", href: "/app", icon: BarChart3 },
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
  { name: "Accueil", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Stocks", href: "/app/stocks", icon: Package, label: "Stocks", permission: "stock", module: "stock" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const commandesNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Commandes", href: "/app/boutique/commandes", icon: ClipboardList, label: "Commandes", permission: "boutique_orders", module: "boutique" },
  { name: "Clients", href: "/app/clients", icon: Users, label: "Clients", permission: "customers" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const managerNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: BarChart3, label: "Accueil" },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart, label: "Ventes", permission: "sales", module: "pos" },
  { name: "Stats", href: "/app/performance", icon: TrendingUp, label: "Stats", permission: "reports" },
  { name: "Profil", href: "/app/profile", icon: User, label: "Profil" },
];

const fusionneNav: NavItem[] = [
  { name: "Accueil", href: "/app", icon: BarChart3, label: "Accueil" },
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary/5 dark:bg-primary/10 border-t-2 border-primary/20 dark:border-primary/30 md:hidden pb-safe backdrop-blur-sm">
        <div className="flex items-center justify-around h-14 px-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors duration-200 min-w-0 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className={`text-[10px] truncate max-w-[56px] ${active ? "font-semibold" : "font-normal"}`}>
                  {item.label || item.name}
                </span>
              </NavLink>
            );
          })}
          {showMenuButton && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors duration-200 min-w-0 text-muted-foreground"
            >
              <Menu className="h-5 w-5 flex-shrink-0 stroke-2" />
              <span className="text-[10px] font-normal">Menu</span>
            </button>
          )}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  Déconnexion
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter ? Toute vente en cours à la caisse sera perdue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { signOut(); setDrawerOpen(false); }}
                  >
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}