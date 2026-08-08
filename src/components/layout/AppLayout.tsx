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
import { Lock, BarChart3, UserSquare2 } from "lucide-react";
import { SubscriptionAlert } from "@/components/subscription/SubscriptionAlert";
import { useSessionWarning } from "@/hooks/useSessionWarning";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { NotificationCenter } from "./NotificationCenter";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { StatScrollerDots } from "./StatScrollerDots";
import { StoreOpenButton } from "@/components/store/StoreOpenButton";


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
    try {
      const { supabase } = await import(/* @vite-ignore */ '@/integrations/supabase/client');
      const { data } = await supabase.rpc('verify_member_pin', {
        _member_id: memberInfo.member_id,
        _pin: pin,
      });
      if (data === true) {
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
    if (path.includes('/clients')) return 'Clients';
    if (path.includes('/devis')) return 'Devis';
    if (path.includes('/factures')) return 'Factures';
    if (path.includes('/paiements')) return 'Paiements';
    if (path.includes('/subscription')) return 'Mon abonnement';
    if (path.includes('/boutique/produits')) return 'Produits en ligne';
    if (path.includes('/boutique/commandes')) return 'Commandes reçues';
    if (path.includes('/boutique/avis')) return 'Avis clients';
    if (path.includes('/boutique')) return 'Ma Boutique';
    return 'Tableau de bord';
  }, [location.pathname]);

  const isHomePage = location.pathname === '/app' || location.pathname === '/app/';
  const isStorePage = location.pathname.includes('/boutique');


  // Pages exclues de l'en-tête centré : Accueil, Caisse, Paramètres + pages d'analyse (titre à gauche)
  const isExcludedHeader = isHomePage
    || location.pathname.includes('/caisse')
    || location.pathname.includes('/settings')
    || location.pathname.includes('/performance')
    || location.pathname.includes('/rapports')
    || location.pathname.includes('/rapport-employes');

  const useCenteredHeader = isMobile && !isExcludedHeader;

  // Bouton d'action à gauche de l'en-tête (analyse / rapport employés)
  const headerLeftAction = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/team')) {
      return { to: '/app/rapport-employes', label: 'Rapport employés', icon: UserSquare2 };
    }
    if (p.includes('/stocks') || p.includes('/ventes') || p.includes('/clients')
      || p.includes('/factures') || p.includes('/devis') || p.includes('/paiements')
      || p.includes('/boutique/commandes') || p.includes('/livraisons')) {
      return { to: '/app/rapports', label: 'Analyse', icon: BarChart3 };
    }
    return null;
  }, [location.pathname]);


  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location]);

  // SPA navigation listener: lets non-component code (toasts, hooks) navigate
  // without using window.location.href (which would reload the app).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') navigate(detail);
    };
    window.addEventListener('app-navigate', handler as EventListener);
    return () => window.removeEventListener('app-navigate', handler as EventListener);
  }, [navigate]);

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
          <header className="app-safe-header sticky top-0 z-40 min-h-14 sm:min-h-16 bg-background/95 backdrop-blur-xl px-4 sm:px-5 flex items-center">
            <div className="w-full flex items-center h-14 sm:h-16">

            {useCenteredHeader ? (
              <div className="relative flex items-center w-full min-w-0">
                <div className="flex items-center flex-shrink-0">
                  {isStorePage ? (
                    <StoreOpenButton />
                  ) : headerLeftAction ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(headerLeftAction.to)}
                      className="h-10 w-10 rounded-full bg-muted/40 border border-border hover:bg-muted text-foreground"
                      title={headerLeftAction.label}
                    >
                      <headerLeftAction.icon className="h-[18px] w-[18px]" />
                    </Button>
                  ) : (
                    <span className="h-10 w-10 block" aria-hidden />
                  )}
                </div>


                <h1 className="absolute left-1/2 -translate-x-1/2 max-w-[55%] text-[19px] leading-none font-bold text-foreground truncate tracking-tight text-center">
                  {pageTitle}
                </h1>

                <div className="ml-auto flex items-center flex-shrink-0 [&_button]:rounded-full [&_button]:bg-muted/40 [&_button]:border [&_button]:border-border [&_button]:hover:bg-muted">
                  <SubscriptionAlert />
                  <NotificationCenter />
                </div>
              </div>
            ) : (
            <div className="flex items-center gap-2 sm:gap-4 w-full min-w-0">
              {!isMobile && (
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0" />
              )}
              {isStorePage && <StoreOpenButton />}


              <div className="flex-1 min-w-0">
                {isMobile && isHomePage ? (
                  <div className="flex items-center gap-2.5">
                    <img src={stocknixLogoIcon} alt="Stocknix" className="h-11 w-11 object-contain flex-shrink-0" />
                    <h1 className="text-[24px] leading-none font-bold text-foreground truncate tracking-tight" style={{ fontFamily: "'Futura', 'Trebuchet MS', Arial, sans-serif" }}>
                      {(() => { const n = company?.name || 'Stocknix'; return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); })()}
                    </h1>
                  </div>
                ) : isMobile ? (
                  <h1 className="text-[22px] leading-none font-bold text-foreground truncate tracking-tight">{pageTitle}</h1>
                ) : (
                  <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 [&_button]:rounded-full [&_button]:bg-muted/40 [&_button]:border [&_button]:border-border [&_button]:hover:bg-muted">
                {!isMobile && <GlobalSearch />}
                {isEmployee && !isMobile && (
                  <Button variant="ghost" size="icon" onClick={handleLock} className="text-muted-foreground hover:text-foreground rounded-full bg-muted/60" title="Verrouiller">
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
                <SubscriptionAlert />
                <ThemeToggle />
                <NotificationCenter />
                {user && <div className="hidden lg:block">{<UserMenu />}</div>}
              </div>

            </div>
            )}
            </div>
          </header>
          <div className={`flex-1 p-3 sm:p-4 md:p-6 lg:px-12 overflow-x-hidden ${isMobile ? 'pb-24' : ''} animate-fade-in`}>
            {children}
            <StatScrollerDots />
          </div>

        </main>
      </div>
      
      {isMobile && !isHomePage && <BottomNav />}
      <PWAInstallBanner />
    </SidebarProvider>
  );
}
