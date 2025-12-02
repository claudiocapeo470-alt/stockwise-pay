import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, CreditCard, Package, Bell, TrendingUp, Shield } from "lucide-react";
const stocknixLogo = "/stocknix-og-image.png";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Stocks", href: "/admin/stocks", icon: Package },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Performance", href: "/admin/performance", icon: TrendingUp },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return "A";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">

      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img 
            src={stocknixLogo} 
            alt="Stocknix" 
            className={collapsed ? "h-8 w-8 object-contain" : "h-10 w-10 object-contain"}
          />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Admin
              </h2>
              <p className="text-xs text-muted-foreground">Espace Administration</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      end={item.href === "/admin"}
                      className={({ isActive }) => `
                        flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                        ${isActive ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100 font-medium' : 'text-muted-foreground hover:bg-muted/50'}
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100 mt-1">
                  <Shield className="h-3 w-3" />
                  Administrateur
                </span>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            onClick={signOut}
            variant="ghost"
            size="icon"
            className="w-full"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
