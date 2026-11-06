import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconTile, type Tone } from "@/components/ui/IconTile";
import { LogOut, LayoutDashboard, Users, CreditCard, Package, Bell, TrendingUp, Shield } from "lucide-react";
import stocknixLogo from "@/assets/stocknix-logo-official.png";
import { cn } from "@/lib/utils";

interface AdminNavItem { name: string; href: string; icon: any; tone: Tone; }

const navigation: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, tone: "blue" },
  { name: "Utilisateurs", href: "/admin/users", icon: Users, tone: "amber" },
  { name: "Abonnements", href: "/admin/subscriptions", icon: CreditCard, tone: "green" },
  { name: "Stocks", href: "/admin/stocks", icon: Package, tone: "violet" },
  { name: "Notifications", href: "/admin/notifications", icon: Bell, tone: "orange" },
  { name: "Performance", href: "/admin/performance", icon: TrendingUp, tone: "cyan" },
];

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

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

  const renderItem = (item: AdminNavItem) => {
    const active = isActive(item.href);

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.href}
              end={item.href === "/admin"}
              aria-label={item.name}
              className={cn("mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl transition-colors duration-150", FOCUS_RING)}
            >
              <IconTile icon={item.icon} tone={item.tone} size={46} active={active} />
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
        end={item.href === "/admin"}
        aria-label={item.name}
        className={cn(
          "flex h-9 items-center gap-2.5 rounded-[9px] px-2 text-[13px] transition-colors duration-150",
          active
            ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          FOCUS_RING,
        )}
      >
        <IconTile icon={item.icon} tone={item.tone} size={26} active={active} />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader>
        <div className={cn("flex items-center gap-2.5 px-3 pt-4", collapsed && "justify-center px-0")}>
          <img
            src={stocknixLogo}
            alt="Stocknix"
            className={cn("rounded-lg object-cover flex-shrink-0", collapsed ? "h-[34px] w-[34px]" : "h-[30px] w-[30px]")}
          />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                <Shield className="h-4 w-4 text-destructive" />
                Admin
              </h2>
              <p className="text-xs text-muted-foreground">Espace Administration</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className={cn("py-1", collapsed ? "px-2" : "px-3")}>
          {!collapsed && (
            <p className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">Navigation</p>
          )}
          <SidebarMenu className="gap-0.5">
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                {renderItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-destructive/10 text-destructive">
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
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <Shield className="h-3 w-3" />
                  Administrateur
                </span>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              aria-label="Déconnexion"
              className={cn("w-full justify-start gap-2", FOCUS_RING)}
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
            aria-label="Déconnexion"
            className={cn("w-full", FOCUS_RING)}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
