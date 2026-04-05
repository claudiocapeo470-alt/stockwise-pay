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
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { NotificationCenter } from "./NotificationCenter";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { PWAInstallBanner } from "./PWAInstallBanner";
import stocknixLogoIcon from '@/assets/stocknix-logo-icon.png';

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
  // Stock alerts - triggers toast notifications on low stock
  useStockAlerts();
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

  const isHomePage = location.pathname === '/app' || location.pathname === '/app/';

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

      <div className="flex min-h-screen w-full max-w-[100vw] bg-background overflow-x-hidden">
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          <header className="sticky top-0 z-40 h-14 sm:h-16 border-b border-border bg-background px-3 sm:px-4 flex items-center">
            <div className="flex items-center gap-2 sm:gap-4 w-full min-w-0">
              {!isMobile && (
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10 flex items-center justify-center transition-colors flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                {isMobile && isHomePage ? (
                  <div className="flex items-center gap-2">
                    <img src={stocknixLogoIcon} alt="Stocknix" className="h-8 w-8 object-contain flex-shrink-0" />
                    <h1 className="text-lg font-bold text-foreground truncate" style={{ fontFamily: "'Futura', 'Trebuchet MS', Arial, sans-serif" }}>
                      {(() => { const n = company?.name || 'Stocknix'; return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); })()}
                    </h1>
                  </div>
                ) : isMobile ? (
                  <div className="flex items-center gap-2">
                    <img src={stocknixLogoIcon} alt="Stocknix" className="h-7 w-7 object-contain flex-shrink-0" />
                    <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
                  </div>
                ) : (
                  <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
                )}
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!isMobile && <GlobalSearch />}
                {isEmployee && !isMobile && (
                  <Button variant="ghost" size="icon" onClick={handleLock} className="text-muted-foreground hover:text-foreground" title="Verrouiller">
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
                <NotificationCenter />
                <ThemeToggle />
                {user && <UserMenu />}
              </div>
            </div>
          </header>
          
          <TrialBanner />
          <div className={`flex-1 p-3 sm:p-4 md:p-6 lg:px-12 overflow-x-hidden ${isMobile ? 'pb-24' : ''} animate-fade-in`}>
            {children}
          </div>
        </main>
      </div>
      
      {isMobile && !isHomePage && <BottomNav />}
      <PWAInstallBanner />
    </SidebarProvider>
  );
}
