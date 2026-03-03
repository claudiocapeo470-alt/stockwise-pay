import { BarChart3, Package, Scan, ShoppingCart, Receipt, TrendingUp, LogOut, User, Settings as SettingsIcon, Store, ShoppingBag, ClipboardList, Star } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanySettings } from "@/hooks/useCompanySettings"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import stocknixLogo from "@/assets/stocknix-logo-official.png";

const navigation = [
  { name: "Tableau de bord", href: "/app", icon: BarChart3 },
  { name: "Gestion des stocks", href: "/app/stocks", icon: Package },
  { name: "Caisse", href: "/app/caisse", icon: Scan },
  { name: "Suivi des ventes", href: "/app/ventes", icon: ShoppingCart },
  { name: "Facturation", href: "/app/facturation", icon: Receipt },
  { name: "Performance & Rapports", href: "/app/performance", icon: TrendingUp },
]

const storeNav = [
  { name: "Ma Boutique", href: "/app/boutique/config", icon: Store },
  { name: "Produits en ligne", href: "/app/boutique/produits", icon: ShoppingBag },
  { name: "Commandes reçues", href: "/app/boutique/commandes", icon: ClipboardList },
  { name: "Avis clients", href: "/app/boutique/avis", icon: Star },
]

const secondaryNav = [
  { name: "Profil", href: "/app/profile", icon: User },
  { name: "Paramètres", href: "/app/settings", icon: SettingsIcon },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const { signOut, user, profile, isAdmin } = useAuth()
  const { settings } = useCompanySettings()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  const displayName = profile?.company_name || 
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Utilisateur');

  const initials = profile?.company_name 
    ? profile.company_name.substring(0, 2).toUpperCase()
    : (profile?.first_name && profile?.last_name
        ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
        : (user?.email?.[0] || 'U').toUpperCase());

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true
    if (path !== "/app" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-60"} bg-sidebar border-r border-sidebar-border`} collapsible="icon">
      {/* Header - 48px height */}
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={settings?.logo_url || stocknixLogo} 
            alt={settings?.company_name || "Stocknix"} 
            className="h-8 w-8 object-contain"
          />
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-foreground text-sm tracking-tight">
                {settings?.company_name || "Stocknix"}
              </h1>
              <p className="text-xs text-muted-foreground">Gestion commerciale</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Navigation principale */}
        <div className="mb-6">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Navigation
            </p>
          )}
          <SidebarMenu className="space-y-1">
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  className={`w-full justify-start h-10 transition-colors duration-200 ${
                    isActive(item.href) 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${isActive(item.href) ? "border-l-[3px] border-l-primary" : ""}`}
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

        {/* Boutique en ligne */}
        <div className="mb-6">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Boutique en ligne
            </p>
          )}
          <SidebarMenu className="space-y-1">
            {storeNav.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  className={`w-full justify-start h-10 transition-colors duration-200 ${
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

        {/* Navigation secondaire */}
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Compte
            </p>
          )}
          <SidebarMenu className="space-y-1">
            {secondaryNav.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  className={`w-full justify-start h-10 transition-colors duration-200 ${
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
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {/* User info */}
        {!isCollapsed && user && (
          <div className="px-3 py-3 mb-2 bg-muted">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {isAdmin && (
                  <span className="text-xs text-primary font-medium">Admin</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Logout button */}
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
  )
}
