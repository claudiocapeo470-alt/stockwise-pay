import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import stocknixLogo from "@/assets/stocknix-logo.png";

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
          <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground">Chargement...</p>
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
        {/* Sidebar - masquée sur mobile/tablette */}
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 flex flex-col">
          {/* Header premium avec gradient subtil */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 py-3 shadow-soft">
            <div className="flex items-center gap-4">
              {/* Trigger sidebar uniquement sur desktop */}
              {!isMobile && <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth" />}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>
              </div>
              <ThemeToggle />
              {user && <UserMenu />}
            </div>
          </header>
          
          {/* Main content area */}
          <div className={`flex-1 p-4 md:p-6 ${isMobile ? 'pb-24' : 'md:px-8 lg:px-12'}`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - visible uniquement sur mobile/tablette */}
      {isMobile && <BottomNav />}
    </SidebarProvider>
  );
}