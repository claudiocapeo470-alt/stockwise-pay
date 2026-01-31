import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { AdminBottomNav } from "./AdminBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Mapping des routes vers les titres
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Administration';
    if (path.includes('/admin/users')) return 'Gestion des Utilisateurs';
    if (path.includes('/admin/subscriptions')) return 'Gestion des Abonnements';
    if (path.includes('/admin/stocks')) return 'Gestion des Stocks';
    if (path.includes('/admin/notifications')) return 'Notifications & Annonces';
    if (path.includes('/admin/performance')) return 'Performance & Rapports';
    return 'Administration';
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/app');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar - masquée sur mobile/tablette */}
        {!isMobile && <AdminSidebar />}
        
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b border-destructive/20 bg-card/80 backdrop-blur-xl px-4 py-3 shadow-soft">
            <div className="flex items-center gap-4">
              {!isMobile && <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth" />}
              <div className="flex-1 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-destructive/10">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>
              </div>
              <ThemeToggle />
              {user && <UserMenu />}
            </div>
          </header>
          <div className={`flex-1 p-4 md:p-6 ${isMobile ? 'pb-24' : 'md:px-8 lg:px-12'}`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - visible uniquement sur mobile/tablette */}
      {isMobile && <AdminBottomNav />}
    </SidebarProvider>
  );
}
