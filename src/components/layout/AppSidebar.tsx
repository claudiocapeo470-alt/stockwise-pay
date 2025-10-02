import { BarChart3, Package, ShoppingCart, Receipt, FileText, TrendingUp, LogOut, User } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/app", icon: BarChart3 },
  { name: "Stocks", href: "/app/stocks", icon: Package },
  { name: "Ventes", href: "/app/ventes", icon: ShoppingCart },
  { name: "Paiements", href: "/app/paiements", icon: Receipt },
  { name: "Performance", href: "/app/performance", icon: TrendingUp },
  { name: "Rapports", href: "/app/rapports", icon: FileText },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const { signOut, user, profile, isAdmin } = useAuth()
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
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} bg-gradient-to-b from-blue-50 to-white dark:from-background dark:to-background border-r border-blue-100 dark:border-border`} collapsible="icon">
      <SidebarHeader className="bg-gradient-to-r from-primary to-blue-600 dark:bg-primary p-4 border-b border-blue-500/20 dark:border-primary-foreground/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-lg ring-2 ring-white/50">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-white text-lg">Stocknix</h1>
              <p className="text-xs text-white/90 font-medium">PME Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-1">
        <SidebarMenu className="space-y-1">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                className={`w-full justify-start rounded-lg transition-all duration-200 ${
                  isActive(item.href) 
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-md hover:shadow-lg dark:bg-primary dark:text-primary-foreground" 
                    : "text-gray-700 hover:text-primary hover:bg-blue-50/80 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
                }`}
              >
                <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2.5">
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-white dark:text-primary-foreground' : ''}`} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-blue-100 dark:border-border bg-blue-50/50 dark:bg-background">
        {!isCollapsed && user && (
          <div className="px-3 py-3 mb-2 bg-white dark:bg-card rounded-lg shadow-sm border border-blue-100 dark:border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{displayName}</p>
                <p className="text-xs text-gray-600 dark:text-muted-foreground truncate">{user.email}</p>
                {isAdmin && (
                  <p className="text-xs text-primary font-medium">Administrateur</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <SidebarMenuItem>
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent rounded-lg transition-all ${
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