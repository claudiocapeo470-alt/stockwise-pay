import { Home, Package, Scan, ShoppingCart, LogOut, Settings as SettingsIcon, Store, ShoppingBag, ClipboardList, Star, Users, Truck, FileText, FileCheck, CreditCard, TrendingUp, Crown, ChevronsUpDown } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingOrdersCount } from '@/hooks/usePendingOrdersCount';
import { IconTile, type Tone } from '@/components/ui/IconTile';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import stocknixLogo from '@/assets/stocknix-logo-official.png';
import { getPerms, isFullAccess, canPos, isDriverOnly } from '@/lib/rolePermissions';
import { cn } from '@/lib/utils';

interface NavItem { name: string; href: string; icon: any; tone: Tone; permission?: string; ownerOnly?: boolean; }
interface NavGroup { label: string; items: NavItem[]; modules?: ('boutique' | 'pos' | 'stock')[]; }

const ALL_GROUPS: NavGroup[] = [
  {
    label: 'Général',
    items: [{ name: 'Tableau de bord', href: '/app', icon: Home, tone: 'blue' }],
  },
  {
    label: 'Vente',
    modules: ['pos'],
    items: [
      { name: 'Caisse POS', href: '/app/caisse', icon: Scan, tone: 'green', permission: 'pos' },
      { name: 'Suivi des ventes', href: '/app/ventes', icon: ShoppingCart, tone: 'orange', permission: 'sales' },
      { name: 'Paiements', href: '/app/paiements', icon: CreditCard, tone: 'green', permission: 'sales' },
    ],
  },
  {
    label: 'Stock',
    modules: ['stock'],
    items: [
      { name: 'Gestion des stocks', href: '/app/stocks', icon: Package, tone: 'violet', permission: 'stock' },
      { name: 'Factures', href: '/app/factures', icon: FileText, tone: 'pink', permission: 'sales' },
      { name: 'Devis', href: '/app/devis', icon: FileCheck, tone: 'amber', permission: 'sales' },
      { name: 'Livraisons', href: '/app/livraisons', icon: Truck, tone: 'cyan', permission: 'deliveries' },
    ],
  },
  {
    label: 'Boutique en ligne',
    modules: ['boutique'],
    items: [
      { name: 'Ma Boutique', href: '/app/boutique/config', icon: Store, tone: 'pink', permission: 'boutique' },
      { name: 'Produits en ligne', href: '/app/boutique/produits', icon: ShoppingBag, tone: 'cyan', permission: 'boutique' },
      { name: 'Commandes reçues', href: '/app/boutique/commandes', icon: ClipboardList, tone: 'orange', permission: 'boutique_orders' },
      { name: 'Avis clients', href: '/app/boutique/avis', icon: Star, tone: 'amber', permission: 'boutique' },
      { name: 'Factures', href: '/app/factures', icon: FileText, tone: 'pink', permission: 'sales' },
      { name: 'Devis', href: '/app/devis', icon: FileCheck, tone: 'amber', permission: 'sales' },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { name: 'Performance', href: '/app/performance', icon: TrendingUp, tone: 'cyan' },
      { name: 'Rapports', href: '/app/rapports', icon: FileText, tone: 'violet', permission: 'reports' },
      { name: 'Rapport Employés', href: '/app/rapport-employes', icon: Users, tone: 'blue', permission: 'reports' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { name: 'Clients', href: '/app/clients', icon: Users, tone: 'amber', permission: 'customers' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { name: 'Mon équipe', href: '/app/team', icon: Users, tone: 'blue', permission: 'settings' },
      { name: 'Paramètres', href: '/app/settings', icon: SettingsIcon, tone: 'violet' },
      { name: 'Mon abonnement', href: '/app/subscription', icon: Crown, tone: 'amber', ownerOnly: true },
    ],
  },
];

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, user, profile, isAdmin, isEmployee, hasPermission, memberInfo } = useAuth();
  const { settings } = useCompanySettings();
  const { selectedModules } = useCompanyModules();
  const { status: subStatus, isLoading: subLoading } = useSubscription();
  const pendingOrders = usePendingOrdersCount();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const isModuleActive = (module: 'boutique' | 'pos' | 'stock') => selectedModules.includes(module);
  const getItemModule = (href: string): 'boutique' | 'pos' | 'stock' | undefined => {
    if (["/app/caisse", "/app/ventes", "/app/paiements"].some(route => href.startsWith(route))) return 'pos';
    if (["/app/stocks", "/app/factures", "/app/devis", "/app/livraisons"].some(route => href.startsWith(route))) return 'stock';
    if (href.startsWith('/app/boutique')) return 'boutique';
    return undefined;
  };

  const shouldShowGroup = (group: NavGroup): boolean => {
    const perms = getPerms(memberInfo);

    if (isEmployee && canPos(perms) && !isFullAccess(perms)) return false;
    if (isEmployee && isDriverOnly(perms)) return false;
    if (group.modules && !group.modules.some(isModuleActive)) return false;

    return true;
  };

  const filterItems = (group: NavGroup): NavItem[] => {
    const perms = getPerms(memberInfo);

    return group.items.filter(item => {
      const itemModule = getItemModule(item.href);

      if (item.ownerOnly && isEmployee) return false;
      if (itemModule && !isModuleActive(itemModule)) return false;

      if (item.href === '/app/rapport-employes' && isEmployee && !isFullAccess(perms)) {
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

  const companyLabel = isEmployee ? (memberInfo?.company_name || 'Stocknix') : (settings?.company_name || 'Stocknix');
  const companyInitials = companyLabel.substring(0, 2).toUpperCase();
  const planLabel = subStatus.planName === 'pro' ? 'Pro' : subStatus.planName === 'business' ? 'Business' : subStatus.planName === 'starter' ? 'Starter' : null;
  const trialPercent = Math.min(100, Math.max(0, (subStatus.trialDaysLeft / 30) * 100));

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const showBadge = item.href === '/app/boutique/commandes' && pendingOrders > 0;

    if (isCollapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.href}
              aria-label={item.name}
              className={cn('relative mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl transition-colors duration-150', FOCUS_RING)}
            >
              <IconTile icon={item.icon} tone={item.tone} size={46} active={active} />
              {showBadge && (
                <span className="absolute right-0.5 top-0.5 h-[9px] w-[9px] rounded-full border-2 border-background animate-ping2" style={{ background: '#E5484D' }} />
              )}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        aria-label={item.name}
        className={cn(
          'flex h-9 items-center gap-2.5 rounded-[9px] px-2 text-[13px] transition-colors duration-150',
          active
            ? 'bg-card font-semibold text-foreground shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          FOCUS_RING,
        )}
      >
        <IconTile icon={item.icon} tone={item.tone} size={26} active={active} />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        {showBadge && (
          <span className="h-[9px] w-[9px] shrink-0 rounded-full animate-ping2" style={{ background: '#E5484D' }} aria-label={`${pendingOrders} commandes en attente`} />
        )}
      </NavLink>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader>
        <div className={cn('flex items-center gap-2.5 px-3 pt-4', isCollapsed && 'justify-center px-0')}>
          <img src={stocknixLogo} alt="Stocknix" className={cn('rounded-lg object-cover flex-shrink-0', isCollapsed ? 'h-[34px] w-[34px]' : 'h-[30px] w-[30px]')} />
          {!isCollapsed && (
            <span className="text-base font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Futura', 'Trebuchet MS', Arial, sans-serif" }}>
              Stocknix
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="px-3 pb-1 pt-2">
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              aria-label="Choisir une entreprise"
              className={cn('flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 text-left transition-colors duration-150 hover:bg-muted', FOCUS_RING)}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-bold text-white">
                {companyInitials}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{companyLabel}</span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {ALL_GROUPS.map(group => {
          if (!shouldShowGroup(group)) return null;
          const items = filterItems(group);
          if (items.length === 0) return null;
          return (
            <div key={group.label} className={cn('py-1', isCollapsed ? 'px-2' : 'px-3')}>
              {!isCollapsed && (
                <p className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>
              )}
              <SidebarMenu className="gap-0.5">
                {items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    {renderItem(item)}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        {!isEmployee && !subLoading && !isCollapsed && (
          subStatus.isTrial ? (
            <div className="mx-2 mb-2 rounded-xl bg-brand-gradient p-3 text-white">
              <p className="text-[13px] font-semibold">Essai gratuit</p>
              <p className="mt-0.5 text-xs text-white/80">
                {subStatus.trialDaysLeft} jour{subStatus.trialDaysLeft > 1 ? 's' : ''} restant{subStatus.trialDaysLeft > 1 ? 's' : ''}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
                <div className="bar-grow animate-grow h-full rounded-full bg-white" style={{ width: `${trialPercent}%` }} />
              </div>
              <NavLink
                to="/app/subscription"
                className={cn('mt-2 inline-block text-xs font-semibold text-white underline underline-offset-2', FOCUS_RING)}
              >
                Choisir une offre
              </NavLink>
            </div>
          ) : planLabel ? (
            <div className="mx-2 mb-2 rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Votre offre</p>
              <p className="text-sm font-semibold text-foreground">{planLabel}</p>
            </div>
          ) : null
        )}
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
            <Button variant="ghost" aria-label="Déconnexion" className={cn('w-full justify-start text-muted-foreground hover:text-destructive', FOCUS_RING)}>
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
