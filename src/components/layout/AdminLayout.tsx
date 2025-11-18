import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { AdminBottomNav } from "./AdminBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { WindmillsParachutesBackground } from "@/components/ui/windmills-parachutes-background";
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
      // Si l'utilisateur n'est pas admin, rediriger vers l'app normale
      navigate('/app');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <WindmillsParachutesBackground />
      <div className="flex min-h-screen w-full">
        {/* Sidebar - masquée sur mobile/tablette */}
        {!isMobile && <AdminSidebar />}
        
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 relative border-b border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-600 via-red-500 to-red-600 dark:from-red-700 dark:via-red-600 dark:to-red-700 px-4 py-3 shadow-md backdrop-blur-lg">
            <div className="flex items-center gap-4">
              {/* Trigger sidebar uniquement sur desktop */}
              {!isMobile && <SidebarTrigger className="-ml-1 text-white hover:bg-red-700/30" />}
              <div className="flex-1 flex items-center gap-2">
                <Shield className="h-5 w-5 text-white" />
                <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
              </div>
              <ThemeToggle />
              {user && <UserMenu />}
            </div>
          </header>
          <div className={`flex-1 p-4 md:p-6 ${isMobile ? 'pb-20' : 'md:px-12 lg:px-16'}`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - visible uniquement sur mobile/tablette */}
      {isMobile && <AdminBottomNav />}
    </SidebarProvider>
  );
}
