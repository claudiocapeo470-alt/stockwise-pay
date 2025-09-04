import { BarChart3, Package, ShoppingCart, Receipt, FileText, LogOut, User } from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Stocks", href: "/stocks", icon: Package },
  { name: "Ventes", href: "/ventes", icon: ShoppingCart },
  { name: "Paiements", href: "/paiements", icon: Receipt },
  { name: "Rapports", href: "/rapports", icon: FileText },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const { signOut, user, isAdmin } = useAuth()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary rounded-lg p-2">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-foreground">GestionPro</h1>
              <p className="text-xs text-muted-foreground">PME Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                className={`w-full justify-start ${
                  isActive(item.href) 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {!isCollapsed && user && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-2">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground">Administrateur</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <SidebarMenuItem>
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Déconnexion</span>}
          </Button>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}