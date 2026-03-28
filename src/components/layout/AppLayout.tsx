import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { LockScreen } from "@/components/auth/LockScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import { useSessionWarning } from "@/hooks/useSessionWarning";
import { StockAlertBell } from "./StockAlertBell";
import { NotificationCenter } from "./NotificationCenter";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { PWAInstallBanner } from "./PWAInstallBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isEmployee, memberInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { company } = useCompany();
  useSessionWarning();
  const [isLocked, setIsLocked] = useState(false);
  const lastActivityRef = useRef(Date.now());

  const lockTimeout = (company?.lock_timeout_minutes || 5) * 60 * 1000;

  // Inactivity timer for employees
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isEmployee) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > lockTimeout) {
        setIsLocked(true);
      }
    }, 10000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [isEmployee, lockTimeout, resetTimer]);

  const handleUnlock = async (pin: string): Promise<boolean> => {
    if (!memberInfo) return false;
    // Verify PIN locally against stored member info
    // We need to check from localStorage since memberInfo doesn't store pin
    try {
      const { supabase } = await import(/* @vite-ignore */ '@/integrations/supabase/client');
      const { data } = await supabase
        .from('company_members')
        .select('pin_code')
        .eq('id', memberInfo.member_id)
        .single();
      if (data?.pin_code === pin) {
        setIsLocked(false);
        resetTimer();
        return true;
      }
    } catch {}
    return false;
  };

  const handleLock = () => setIsLocked(true);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/') return 'Tableau de bord';
    if (path.includes('/caisse')) return 'Caisse';
    if (path.includes('/stocks')) return 'Gestion des stocks';
    if (path.includes('/ventes')) return 'Suivi des ventes';
    if (path.includes('/facturation')) return 'Facturation';
    if (path.includes('/rapport-employes')) return 'Rapport Employés';
    if (path.includes('/rapports')) return 'Rapports & Analyses';
    if (path.includes('/performance')) return 'Performance';
    if (path.includes('/profile')) return 'Profil';
    if (path.includes('/settings')) return 'Paramètres';
    if (path.includes('/team')) return 'Mon équipe';
    if (path.includes('/livraisons')) return 'Livraisons';
    if (path.includes('/boutique')) return 'Boutique en ligne';
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
      {/* Lock Screen overlay */}
      {isLocked && isEmployee && memberInfo && (
        <LockScreen
          memberName={`${memberInfo.member_first_name} ${memberInfo.member_last_name || ''}`}
          companyName={memberInfo.company_name}
          companyLogo={memberInfo.company_logo_url || undefined}
          onUnlock={handleUnlock}
        />
      )}

      <div className="flex min-h-screen w-full bg-background">
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-16 border-b border-border bg-background px-4 flex items-center">
            <div className="flex items-center gap-4 w-full">
              {!isMobile && (
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10 flex items-center justify-center transition-colors" />
              )}
              
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <GlobalSearch />
                {isEmployee && (
                  <Button variant="ghost" size="icon" onClick={handleLock} className="text-muted-foreground hover:text-foreground" title="Verrouiller">
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
                <NotificationCenter />
                <StockAlertBell />
                <ThemeToggle />
                {user && <UserMenu />}
              </div>
            </div>
          </header>
          
          <TrialBanner />
          <div className={`flex-1 p-4 md:p-6 lg:px-12 ${isMobile ? 'pb-24' : ''} animate-fade-in`}>
            {children}
          </div>
        </main>
      </div>
      
      {isMobile && <BottomNav />}
      <PWAInstallBanner />
    </SidebarProvider>
  );
}
