import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Receipt, TrendingUp, AlertTriangle, Plus, ChevronRight, Wallet } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ProductArt } from "@/components/ui/ProductArt";
import { useCompany } from "@/hooks/useCompany";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { fmtNum, DashCard, EmptyState, SkeletonBlock, AreaChart, BarRow, paymentInfo, fmtFcfa, rise } from "./DashboardParts";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeGuide, WELCOME_GUIDE_VERSION } from "@/components/onboarding/WelcomeGuide";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";



export function AdminOwnerDashboard() {
  const { products } = useProducts();
  const { sales, isLoading } = useSales();
  const { company } = useCompany();
  const { settings } = useCompanySettings();
  const companyName = settings?.company_name?.trim() || company?.name?.trim() || 'Votre entreprise';
  const [period, setPeriod] = useState<'today' | '7' | '30'>('today');
  const { payments } = usePayments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const isEmailConfirmed = urlParams.get('confirmed') === 'true';
  const storedVersion = user?.id ? localStorage.getItem(`welcome-guide-version-${user.id}`) : null;
  const isFirstLogin = user?.id ? (!storedVersion || storedVersion < WELCOME_GUIDE_VERSION) : false;
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStockProductsList = products.filter(p => p.quantity <= p.min_quantity);
    const lowStockProducts = lowStockProductsList.length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todaySales = sales.filter(sale => {
      const today = new Date();
      const saleDate = new Date(sale.sale_date);
      return saleDate.toDateString() === today.toDateString();
    });
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const now = new Date();
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    return { totalProducts, lowStockProducts, lowStockProductsList, totalSales, todaySales: todaySales.length, todayTotal, pendingPayments, monthlyRevenue };
  }, [products, sales, payments]);

  useEffect(() => {
    if (user?.id) {
      if (isEmailConfirmed && isFirstLogin) {
        setShowWelcomeGuide(true);
        window.history.replaceState(null, '', '/app');
      } else if (isFirstLogin && !isEmailConfirmed) {
        setShowWelcomeGuide(true);
      }
    }
  }, [user?.id, isFirstLogin, isEmailConfirmed]);

  const handleCloseWelcomeGuide = () => {
    if (user?.id) localStorage.setItem(`welcome-guide-version-${user.id}`, WELCOME_GUIDE_VERSION);
    setShowWelcomeGuide(false);
  };

  const view = useMemo(() => {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    if (period !== 'today') start.setDate(start.getDate() - (Number(period) - 1));
    const inPeriod = sales.filter(s => new Date(s.sale_date) >= start);
    const revenue = inPeriod.reduce((a, s) => a + s.total_amount, 0);
    const avg = inPeriod.length ? revenue / inPeriod.length : 0;
    const days: { label: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const list = sales.filter(s => new Date(s.sale_date).toDateString() === ds);
      days.push({ label: format(d, 'EEE', { locale: fr }).replace('.', ''), total: list.reduce((a, s) => a + s.total_amount, 0), count: list.length });
    }
    const byProduct = new Map<string, { name: string; image?: string | null; category?: string | null; qty: number }>();
    inPeriod.forEach(s => {
      const cur = byProduct.get(s.product_id) || { name: s.products?.name || 'Produit', image: s.products?.image_url, category: s.products?.category, qty: 0 };
      cur.qty += s.quantity; byProduct.set(s.product_id, cur);
    });
    const top = [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
    const pay = new Map<string, { label: string; dot: string; total: number }>();
    inPeriod.forEach(s => { const p = paymentInfo(s.payment_method); const c = pay.get(p.label) || { ...p, total: 0 }; c.total += s.total_amount; pay.set(p.label, c); });
    const payList = [...pay.values()].sort((a, b) => b.total - a.total);
    const recent = [...sales].sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()).slice(0, 6);
    return { revenue, count: inPeriod.length, avg, days, top, payList, recent };
  }, [sales, period]);

  const periodLabel = period === 'today' ? "aujourd'hui" : `sur ${period} jours`;
  const topMax = view.top[0]?.qty || 1;
  const payTotal = view.payList.reduce((a, p) => a + p.total, 0);

  const kpis = [
    { title: "Chiffre d'affaires", value: fmtNum(view.revenue), unit: "FCFA", icon: TrendingUp, hero: true, trend: view.days.map(d => d.total), delta: `Mois : ${fmtNum(metrics.monthlyRevenue)}` },
    { title: "Ventes", value: String(view.count), icon: ShoppingCart, tone: "green" as const, trend: view.days.map(d => d.count), delta: periodLabel },
    { title: "Panier moyen", value: fmtNum(view.avg), unit: "FCFA", icon: Wallet, tone: "violet" as const, delta: `${metrics.pendingPayments} paiement${metrics.pendingPayments > 1 ? "s" : ""} en attente`, deltaTone: metrics.pendingPayments > 0 ? "warn" as const : "up" as const },
    { title: "Alertes de stock", value: String(metrics.lowStockProducts), icon: AlertTriangle, tone: "orange" as const, delta: `${metrics.totalProducts} produits`, deltaTone: metrics.lowStockProducts > 0 ? "warn" as const : "up" as const },
  ];

  const recentCard = (
    <DashCard index={6} title="Ventes récentes" className="flex-1" action={<Button variant="ghost" size="sm" onClick={() => navigate('/app/ventes')}>Voir tout <ChevronRight className="h-4 w-4 ml-1" /></Button>}>
      {view.recent.length === 0 ? (
        <EmptyState message="Aucune vente pour le moment" actionLabel="Nouvelle vente" onAction={() => navigate('/app/caisse')} />
      ) : (
        <ul className="divide-y divide-border">
          {view.recent.map((sale) => {
            const p = paymentInfo(sale.payment_method);
            return (
              <li key={sale.id} className="flex items-center gap-3 py-2.5 min-w-0">
                <ProductArt name={sale.products?.name} imageUrl={sale.products?.image_url} category={sale.products?.category || undefined} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{sale.customer_name?.replace(/\s+/g, ' ').trim() || sale.products?.name || 'Client comptoir'}</p>
                  <p className="truncate text-xs text-muted-foreground">{sale.products?.name || 'Produit'} · {sale.quantity} article{sale.quantity > 1 ? 's' : ''} · {format(new Date(sale.sale_date), "dd MMM HH:mm", { locale: fr })}</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0"><span className={cn("h-2 w-2 rounded-full", p.dot)} />{p.label}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{fmtFcfa(sale.total_amount)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </DashCard>
  );

  const restockCard = (
    <DashCard index={5} title="À réapprovisionner" action={<Button variant="ghost" size="sm" onClick={() => navigate('/app/stocks')}>Stock <ChevronRight className="h-4 w-4 ml-1" /></Button>}>
      {metrics.lowStockProductsList.length === 0 ? (
        <EmptyState message="Tous vos stocks sont au bon niveau" />
      ) : (
        <ul className="space-y-2.5">
          {metrics.lowStockProductsList.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center gap-3 min-w-0">
              <ProductArt name={p.name} imageUrl={p.image_url} category={p.category || undefined} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">Seuil : {p.min_quantity}</p>
              </div>
              <span className={cn("inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums", p.quantity <= 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>{p.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );

  const topCard = (
    <DashCard index={5} title="Top produits">
      {view.top.length === 0 ? (
        <EmptyState message="Pas encore de ventes sur cette période" />
      ) : (
        <div className="space-y-3">
          {view.top.map((t, i) => (
            <BarRow key={i} name={t.name} imageUrl={t.image} category={t.category} right={`${t.qty} vendu${t.qty > 1 ? 's' : ''}`} pct={(t.qty / topMax) * 100} color={["bg-primary", "bg-success", "bg-warning", "bg-accent", "bg-destructive"][i]} />
          ))}
        </div>
      )}
    </DashCard>
  );

  const payCard = payTotal > 0 ? (
    <DashCard index={7} title="Modes de paiement">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {view.payList.map((p) => <div key={p.label} className={cn("h-full origin-left animate-grow", p.dot)} style={{ width: `${(p.total / payTotal) * 100}%` }} />)}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {view.payList.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-xs min-w-0">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", p.dot)} />
            <span className="truncate text-muted-foreground">{p.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{Math.round((p.total / payTotal) * 100)} %</span>
          </li>
        ))}
      </ul>
    </DashCard>
  ) : null;

  return (
    <div className="flex flex-col gap-4 lg:gap-5 min-h-[calc(100dvh-8rem)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-rise">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground truncate first-letter:uppercase">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })} · {companyName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Période" className="inline-flex rounded-xl border border-border bg-card p-1">
            {([['today', "Aujourd'hui"], ['7', '7 jours'], ['30', '30 jours']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPeriod(k)} aria-pressed={period === k} className={cn("h-9 rounded-lg px-3 text-sm font-medium transition-colors", period === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{l}</button>
            ))}
          </div>
          <Button onClick={() => navigate('/app/caisse')} className="cta-shine h-11 rounded-xl px-4 text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nouvelle vente</Button>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">{[0, 1, 2, 3].map(i => <SkeletonBlock key={i} className="h-[128px]" />)}</div>
          <div className="grid gap-4 lg:grid-cols-[3fr_1.6fr]"><SkeletonBlock className="h-[290px]" /><SkeletonBlock className="h-[290px]" /></div>
          <SkeletonBlock className="h-[320px]" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {kpis.map((k, i) => (
              <KpiCard key={k.title} {...k} style={rise(i)} className={cn(!k.hero && "border border-border bg-card", "min-w-0")} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[3fr_1.6fr]">
            <DashCard index={4} title="Chiffre d'affaires · 7 jours" className="md:col-span-2 lg:col-span-1" action={<span className="text-sm font-semibold tabular-nums">{fmtFcfa(view.days.reduce((a, d) => a + d.total, 0))}</span>}>
              <AreaChart values={view.days.map(d => d.total)} labels={view.days.map(d => d.label)} />
            </DashCard>
            {topCard}
            <div className="lg:hidden">{restockCard}</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[3fr_1.6fr] flex-1">
            <div className="flex flex-col min-w-0">{recentCard}</div>
            <div className="flex flex-col gap-4 min-w-0">
              <div className="hidden lg:block">{restockCard}</div>
              {payCard}
            </div>
          </div>
        </>
      )}

      {showWelcomeGuide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WelcomeGuide onClose={handleCloseWelcomeGuide} />
        </div>
      )}
    </div>
  );
}
