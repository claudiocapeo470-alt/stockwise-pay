import { BarChart3, Package, Scan, ShoppingCart, LogOut, User, Settings as SettingsIcon, Store, ShoppingBag, ClipboardList, Star, Users, Truck, FileText, FileCheck, CreditCard, TrendingUp, Crown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import stocknixLogo from '@/assets/stocknix-logo-official.png';

interface NavItem { name: string; href: string; icon: any; permission?: string; ownerOnly?: boolean; }
interface NavGroup { label: string; items: NavItem[]; modules?: ('boutique' | 'pos' | 'stock')[]; }

const ALL_GROUPS: NavGroup[] = [
  {
    label: 'PRINCIPAL',
    items: [{ name: 'Tableau de bord', href: '/app', icon: BarChart3 }],
  },
  {
    label: 'CAISSE & VENTES',
    modules: ['pos'],
    items: [
      { name: 'Caisse POS', href: '/app/caisse', icon: Scan, permission: 'pos' },
      { name: 'Suivi des ventes', href: '/app/ventes', icon: ShoppingCart, permission: 'sales' },
      { name: 'Paiements', href: '/app/paiements', icon: CreditCard, permission: 'sales' },
    ],
  },
  {
    label: 'STOCK & INVENTAIRE',
    modules: ['stock'],
    items: [
      { name: 'Gestion des stocks', href: '/app/stocks', icon: Package, permission: 'stock' },
      { name: 'Factures', href: '/app/factures', icon: FileText, permission: 'sales' },
      { name: 'Devis', href: '/app/devis', icon: FileCheck, permission: 'sales' },
      { name: 'Livraisons', href: '/app/livraisons', icon: Truck, permission: 'deliveries' },
    ],
  },
  {
    label: 'BOUTIQUE EN LIGNE',
    modules: ['boutique'],
    items: [
      { name: 'Ma Boutique', href: '/app/boutique/config', icon: Store, permission: 'boutique' },
      { name: 'Produits en ligne', href: '/app/boutique/produits', icon: ShoppingBag, permission: 'boutique' },
      { name: 'Commandes reçues', href: '/app/boutique/commandes', icon: ClipboardList, permission: 'boutique_orders' },
      { name: 'Avis clients', href: '/app/boutique/avis', icon: Star, permission: 'boutique' },
      { name: 'Factures', href: '/app/factures', icon: FileText, permission: 'sales' },
      { name: 'Devis', href: '/app/devis', icon: FileCheck, permission: 'sales' },
    ],
  },
  {
    label: 'ANALYTIQUE',
    items: [
      { name: 'Performance', href: '/app/performance', icon: TrendingUp },
      { name: 'Rapports', href: '/app/rapports', icon: FileText, permission: 'reports' },
      { name: 'Rapport Employés', href: '/app/rapport-employes', icon: Users, permission: 'reports' },
    ],
  },
  {
    label: 'CLIENTS',
    items: [
      { name: 'Clients', href: '/app/clients', icon: Users, permission: 'customers' },
    ],
  },
  {
    label: 'ÉQUIPE & COMPTE',
    items: [
      { name: 'Mon équipe', href: '/app/team', icon: Users, permission: 'settings' },
      { name: 'Profil', href: '/app/profile', icon: User },
      { name: 'Paramètres', href: '/app/settings', icon: SettingsIcon },
      { name: 'Mon abonnement', href: '/app/subscription', icon: Crown, ownerOnly: true },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, user, profile, isAdmin, isEmployee, hasPermission, memberInfo } = useAuth();
  const { settings } = useCompanySettings();
  const { selectedModules } = useCompanyModules();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isModuleActive = (module: 'boutique' | 'pos' | 'stock') => selectedModules.includes(module);
  const getItemModule = (href: string): 'boutique' | 'pos' | 'stock' | undefined => {
    if (["/app/caisse", "/app/ventes", "/app/paiements"].some(route => href.startsWith(route))) return 'pos';
    if (["/app/stocks", "/app/factures", "/app/devis", "/app/livraisons"].some(route => href.startsWith(route))) return 'stock';
    if (href.startsWith('/app/boutique')) return 'boutique';
    return undefined;
  };

  const shouldShowGroup = (group: NavGroup): boolean => {
    const role = (memberInfo?.member_role_name || '').toLowerCase();

    if (isEmployee && role.includes('caissier')) return false;
    if (isEmployee && role.includes('livreur')) return false;
    if (group.modules && !group.modules.some(isModuleActive)) return false;

    return true;
  };

  const filterItems = (group: NavGroup): NavItem[] => {
    const role = (memberInfo?.member_role_name || '').toLowerCase();

    return group.items.filter(item => {
      const itemModule = getItemModule(item.href);

      if (item.ownerOnly && isEmployee) return false;
      if (itemModule && !isModuleActive(itemModule)) return false;

      if (item.href === '/app/rapport-employes' && isEmployee && !role.includes('manager')) {
        return false;
      }

      if (item.href === '/app/performance' && isEmployee && !hasPermission('reports')) {
        return false;
      }

      if (!item.permission) return true;
      if (!isEmployee) return true;
      return hasPermission(item.permission);
    });
  };

  const displayName = isEmployee
    ? `${memberInfo?.member_first_name || ''} ${memberInfo?.member_last_name || ''}`.trim()
    : profile?.company_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Utilisateur');

  const initials = isEmployee
    ? `${(memberInfo?.member_first_name || 'E')[0]}${(memberInfo?.member_last_name || '')[0] || ''}`.toUpperCase()
    : profile?.company_name ? profile.company_name.substring(0, 2).toUpperCase()
    : (profile?.first_name && profile?.last_name ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : (user?.email?.[0] || 'U').toUpperCase());

  const isActive = (path: string) => {
    if (path === '/app' && location.pathname === '/app') return true;
    if (path !== '/app' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const companyLogo = isEmployee ? (memberInfo?.company_logo_url || stocknixLogo) : (settings?.logo_url || stocknixLogo);
  const companyLabel = isEmployee ? (memberInfo?.company_name || 'Stocknix') : (settings?.company_name || 'Stocknix');
  const roleLabel = isEmployee ? (memberInfo?.member_role_name || 'Employé') : 'Gestion commerciale';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-4">
          <img src={companyLogo} alt="Logo" className="h-8 w-8 rounded-lg object-cover flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{companyLabel}</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {ALL_GROUPS.map(group => {
          if (!shouldShowGroup(group)) return null;
          const items = filterItems(group);
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="px-2 py-1">
              {!isCollapsed && (
                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                  {group.label}
                </p>
              )}
              <SidebarMenu>
                {items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <NavLink to={item.href}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        {!isCollapsed && user && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{isEmployee ? (memberInfo?.member_role_name || '') : user.email}</p>
                {isAdmin && !isEmployee && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Admin</span>}
              </div>
            </div>
          </div>
        )}
      <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Déconnexion</span>}
            </Button>
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
                onClick={() => signOut()}
              >
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}