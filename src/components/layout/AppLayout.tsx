import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Mapping des routes vers les titres
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/') return 'Tableau de bord';
    if (path.includes('/caisse')) return 'Caisse';
    if (path.includes('/stocks')) return 'Gestion des stocks';
    if (path.includes('/ventes')) return 'Suivi des ventes';
    if (path.includes('/facturation')) return 'Facturation';
    if (path.includes('/performance')) return 'Performance & Rapports';
    if (path.includes('/profile')) return 'Profil';
    if (path.includes('/settings')) return 'Paramètres';
    return 'Tableau de bord';
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar - desktop uniquement */}
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 flex flex-col">
          {/* Header - 64px */}
          <header className="sticky top-0 z-40 h-16 border-b border-border bg-background px-4 flex items-center">
            <div className="flex items-center gap-4 w-full">
              {/* Trigger sidebar desktop */}
              {!isMobile && (
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10 flex items-center justify-center transition-colors" />
              )}
              
              {/* Page title */}
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {user && <UserMenu />}
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <div className={`flex-1 p-4 md:p-6 lg:px-12 ${isMobile ? 'pb-24' : ''} animate-fade-in`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - mobile uniquement */}
      {isMobile && <BottomNav />}
    </SidebarProvider>
  );
}
