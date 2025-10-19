import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { WindmillsParachutesBackground } from "@/components/ui/windmills-parachutes-background";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <WindmillsParachutesBackground />
      <div className="flex min-h-screen w-full">
        {/* Sidebar - masquée sur mobile/tablette */}
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 flex flex-col">
          <header className="relative border-b border-blue-200 dark:border-blue-800/40 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-700 dark:via-blue-600 dark:to-blue-700 px-4 py-3 shadow-md">
            <div className="flex items-center gap-4">
              {/* Trigger sidebar uniquement sur desktop */}
              {!isMobile && <SidebarTrigger className="-ml-1 text-white hover:bg-blue-700/30" />}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Dashboard</h2>
              </div>
              <ThemeToggle />
              {user && <UserMenu />}
            </div>
          </header>
          <div className={`flex-1 p-4 md:p-6 ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - visible uniquement sur mobile/tablette */}
      {isMobile && <BottomNav />}
    </SidebarProvider>
  );
}