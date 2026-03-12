import { BarChart3, Package, Scan, ShoppingCart, LogOut, User, Settings as SettingsIcon, Store, ShoppingBag, ClipboardList, Star, Users, Truck, FileText, FileCheck, CreditCard, TrendingUp, Layers } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanySettings } from "@/hooks/useCompanySettings"
import { useCompanyModules } from "@/hooks/useCompanyModules"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import stocknixLogo from "@/assets/stocknix-logo-official.png";

interface NavItem { name: string; href: string; icon: any; permission?: string; }
interface NavGroup { label: string; items: NavItem[]; modules?: ('boutique' | 'pos' | 'stock')[]; }

const ALL_GROUPS: NavGroup[] = [
  {
    label: "PRINCIPAL",
    items: [{ name: "Tableau de bord", href: "/app", icon: BarChart3 }],
  },
  {
    label: "CAISSE & VENTES",
    modules: ["pos"],
    items: [
      { name: "Caisse POS", href: "/app/caisse", icon: Scan, permission: "pos" },
      { name: "Suivi des ventes", href: "/app/ventes", icon: ShoppingCart, permission: "sales" },
      { name: "Paiements", href: "/app/paiements", icon: CreditCard, permission: "sales" },
    ],
  },
  {
    label: "STOCK & INVENTAIRE",
    modules: ["stock"],
    items: [
      { name: "Gestion des stocks", href: "/app/stocks", icon: Package, permission: "stock" },
      { name: "Factures", href: "/app/factures", icon: FileText, permission: "sales" },
      { name: "Devis", href: "/app/devis", icon: FileCheck, permission: "sales" },
      { name: "Livraisons", href: "/app/livraisons", icon: Truck, permission: "deliveries" },
    ],
  },
  {
    label: "BOUTIQUE EN LIGNE",
    modules: ["boutique"],
    items: [
      { name: "Ma Boutique", href: "/app/boutique/config", icon: Store, permission: "boutique" },
      { name: "Produits en ligne", href: "/app/boutique/produits", icon: ShoppingBag, permission: "boutique" },
      { name: "Commandes reçues", href: "/app/boutique/commandes", icon: ClipboardList, permission: "boutique_orders" },
      { name: "Avis clients", href: "/app/boutique/avis", icon: Star, permission: "boutique" },
    ],
  },
  {
    label: "ANALYTIQUE",
    items: [
      { name: "Performance", href: "/app/performance", icon: TrendingUp, permission: "reports" },
      { name: "Rapports", href: "/app/rapports", icon: FileText, permission: "reports" },
      { name: "Rapport Employés", href: "/app/rapport-employes", icon: Users, permission: "reports" },
    ],
  },
  {
    label: "ÉQUIPE & COMPTE",
    items: [
      { name: "Mon équipe", href: "/app/team", icon: Users, permission: "settings" },
      { name: "Profil", href: "/app/profile", icon: User },
      { name: "Paramètres", href: "/app/settings", icon: SettingsIcon },
      { name: "Mes modules", href: "/onboarding", icon: Layers },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, user, profile, isAdmin, isEmployee, hasPermission, memberInfo } = useAuth();
  const { settings } = useCompanySettings();
  const { selectedModules } = useCompanyModules();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const shouldShowGroup = (group: NavGroup): boolean => {
    if (!group.modules) return true;
    if (isEmployee) return true;
    return group.modules.some(m => selectedModules.includes(m));
  };

  const filterItems = (group: NavGroup): NavItem[] => {
    if (!isEmployee) return group.items;
    return group.items.filter(item => !item.permission || hasPermission(item.permission));
  };

  const displayName = isEmployee
    ? `${memberInfo?.member_first_name || ''} ${memberInfo?.member_last_name || ''}`.trim()
    : profile?.company_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Utilisateur');

  const initials = isEmployee
    ? `${(memberInfo?.member_first_name || 'E')[0]}${(memberInfo?.member_last_name || '')[0] || ''}`.toUpperCase()
    : profile?.company_name
      ? profile.company_name.substring(0, 2).toUpperCase()
      : (profile?.first_name && profile?.last_name ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : (user?.email?.[0] || 'U').toUpperCase());

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const companyLogo = isEmployee ? (memberInfo?.company_logo_url || stocknixLogo) : (settings?.logo_url || stocknixLogo);
  const companyLabel = isEmployee ? (memberInfo?.company_name || "Stocknix") : (settings?.company_name || "Stocknix");
  const roleLabel = isEmployee ? (memberInfo?.member_role_name || 'Employé') : 'Gestion commerciale';

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-60"} bg-sidebar border-r border-sidebar-border`} collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt={companyLabel} className="h-8 w-8 object-contain" />
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-foreground text-sm tracking-tight">{companyLabel}</h1>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {ALL_GROUPS.map(group => {
          if (!shouldShowGroup(group)) return null;
          const items = filterItems(group);
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <SidebarMenu className="space-y-0.5">
                {items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start h-9 transition-colors duration-200 ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <NavLink to={item.href} className="flex items-center gap-3 px-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm">{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="px-3 py-3 mb-2 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={isEmployee ? (memberInfo?.member_photo_url || '') : (profile?.avatar_url || '')} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isEmployee ? (memberInfo?.member_role_name || '') : user.email}
                </p>
                {isAdmin && !isEmployee && (
                  <span className="text-xs text-primary font-medium">Admin</span>
                )}
              </div>
            </div>
          </div>
        )}

        <SidebarMenuItem>
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2 text-sm">Déconnexion</span>}
          </Button>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
