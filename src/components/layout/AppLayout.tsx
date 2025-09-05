import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, hasActiveSubscription, subscription } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (!loading && user && !hasActiveSubscription && !subscription?.is_legacy) {
      // Non-legacy users without subscription must pay
      navigate('/auth');
    }
  }, [user, loading, hasActiveSubscription, subscription, navigate, location]);

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

  // Check subscription status for access control
  if (user && !hasActiveSubscription && !subscription?.is_legacy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Abonnement requis</h2>
          <p className="text-muted-foreground">
            Vous devez souscrire à un abonnement pour accéder à l'application.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border bg-background px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
              </div>
              {user && <UserMenu />}
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}