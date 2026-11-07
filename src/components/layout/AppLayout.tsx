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
import { PageLoader } from "@/components/ui/PageLoader";
import { Lock } from "lucide-react";
import { SubscriptionAlert } from "@/components/subscription/SubscriptionAlert";
import { useSessionWarning } from "@/hooks/useSessionWarning";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { useBusinessAlerts } from "@/hooks/useBusinessAlerts";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCenter } from "./NotificationCenter";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { StatScrollerDots } from "./StatScrollerDots";


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
  const [storeId, setStoreId] = useState<string>();
  const ownerId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;
  useEffect(() => {
    if (!ownerId) {
      setStoreId(undefined);
      return;
    }
    let cancelled = false;
    void supabase
      .from('online_store')
      .select('id')
      .eq('user_id', ownerId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setStoreId(data?.id);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId]);
  useSessionWarning();
  // Stock alerts - triggers toast notifications on low stock
  useStockAlerts();
  useBusinessAlerts();
  useOrderNotifications(storeId, company?.id);
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
    if (path.includes('/notifications')) return 'Notifications';
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

  // Mesure la hauteur réelle de l'en-tête (safe-area incluse) : évite tout espace vide
  // au-dessus des blocs figés (KPI, filtres) des pages.
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty('--app-header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [loading, user]);

  if (loading) {
    return <PageLoader />;
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
          <header ref={headerRef} className="app-safe-header sticky top-0 z-40 min-h-14 sm:min-h-16 bg-background/95 backdrop-blur-xl px-4 sm:px-5 md:px-6 lg:px-10 xl:px-12 flex items-center border-b border-transparent">
            <div className="w-full max-w-[1440px] mx-auto flex items-center h-14 sm:h-16">


            <div className="flex items-center gap-2 sm:gap-4 w-full min-w-0">
              {!isMobile && (
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0" />
              )}
              {isMobile && !isHomePage && <div id="mobile-page-secondary-action" className="flex shrink-0 items-center" />}
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

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 [&_button]:h-11 [&_button]:w-11 [&_button]:rounded-xl [&_button]:bg-card [&_button]:border [&_button]:border-border [&_button]:shadow-sm [&_button]:hover:bg-muted">
                {isEmployee && !isMobile && (
                  <Button variant="ghost" size="icon" onClick={handleLock} className="text-muted-foreground hover:text-foreground" title="Verrouiller">
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
                <SubscriptionAlert />
                {isHomePage && <ThemeToggle />}
                {isHomePage && <NotificationCenter />}
                {user && <div className="hidden lg:block">{<UserMenu />}</div>}
              </div>

            </div>
            </div>
          </header>
          <div
            className={`flex-1 px-3 sm:px-5 md:px-6 lg:px-10 xl:px-12 overflow-x-hidden pt-3 sm:pt-5 md:pt-6 ${
              isMobile ? 'pb-24' : 'pb-10'
            } animate-fade-in`}
          >
            <div className="w-full max-w-[1440px] mx-auto min-w-0">
              {children}
            </div>
            <StatScrollerDots />
          </div>


        </main>
      </div>
      
      {isMobile && !isHomePage && <BottomNav />}
      <PWAInstallBanner />
    </SidebarProvider>
  );
}
