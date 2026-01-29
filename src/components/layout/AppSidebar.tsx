import { BarChart3, Package, Scan, ShoppingCart, Receipt, TrendingUp, LogOut, User, Settings as SettingsIcon } from "lucide-react"
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
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border`} collapsible="icon">
      {/* Header with brand gradient */}
      <SidebarHeader className="bg-gradient-to-br from-background via-card to-background p-4 border-b border-sidebar-border relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/10 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-60" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-lg opacity-40" />
            <img 
              src={settings?.logo_url || stocknixLogo} 
              alt={settings?.company_name || "Stocknix"} 
              className="h-10 w-10 object-contain rounded-xl relative z-10 ring-2 ring-primary/20"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-foreground text-lg tracking-tight">
                {settings?.company_name || "Stocknix"}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">PME Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-1">
        <SidebarMenu className="space-y-1.5">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                className={`w-full justify-start rounded-xl transition-all duration-300 ${
                  isActive(item.href) 
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2.5">
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-primary-foreground' : 'text-primary'}`} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="px-3 py-3 mb-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {isAdmin && (
                  <p className="text-xs text-primary font-semibold">Administrateur</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <SidebarMenuItem>
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Déconnexion</span>}
          </Button>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}
