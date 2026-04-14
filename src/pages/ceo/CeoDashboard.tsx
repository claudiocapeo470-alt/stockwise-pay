import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, CreditCard, Package, TrendingUp, AlertTriangle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Metrics {
  totalUsers: number;
  newUsersThisWeek: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalProducts: number;
  lowStockProducts: number;
  conversionRate: number;
}

interface RecentProfile { first_name: string | null; last_name: string | null; email: string | null; created_at: string }
interface RecentSub { email: string; plan_name: string | null; subscribed: boolean; is_trial: boolean | null; created_at: string }

export default function CeoDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentProfile[]>([]);
  const [recentSubs, setRecentSubs] = useState<RecentSub[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [profiles, subs, products, salesMonth, recent5, recentSubs5] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }),
        supabase.from('subscribers').select('*'),
        supabase.from('products').select('quantity, min_quantity', { count: 'exact' }),
        supabase.from('sales').select('total_amount').gte('sale_date', monthStart),
        supabase.from('profiles').select('first_name, last_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscribers').select('email, plan_name, subscribed, is_trial, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalUsers = profiles.count || 0;
      const newUsersThisWeek = (profiles.data || []).filter(p => p.created_at >= weekAgo).length;
      const subsData = subs.data || [];
      const active = subsData.filter(s => s.subscribed).length;
      const trial = subsData.filter(s => s.is_trial).length;
      const expired = subsData.filter(s => !s.subscribed).length;
      const totalRevenue = subsData.filter(s => s.subscribed).reduce((sum, s) => sum + (s.plan_price || 0), 0);
      const revenueMonth = (salesMonth.data || []).reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const totalProds = products.count || 0;
      const lowStock = (products.data || []).filter(p => p.quantity <= p.min_quantity).length;

      setMetrics({
        totalUsers, newUsersThisWeek, activeSubscriptions: active, trialSubscriptions: trial,
        expiredSubscriptions: expired, totalRevenue, revenueThisMonth: revenueMonth,
        totalProducts: totalProds, lowStockProducts: lowStock,
        conversionRate: totalUsers > 0 ? Math.round((active / totalUsers) * 100) : 0,
      });
      setRecentUsers(recent5.data || []);
      setRecentSubs(recentSubs5.data || []);
    } catch (err: any) {
      toast.error('Erreur chargement', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const METRIC_CARDS = metrics ? [
    { label: 'Utilisateurs', value: metrics.totalUsers, sub: `+${metrics.newUsersThisWeek} cette semaine`, icon: Users, color: 'text-teal-400' },
    { label: 'Abonnés actifs', value: metrics.activeSubscriptions, sub: `${metrics.conversionRate}% conversion`, icon: CreditCard, color: 'text-emerald-400' },
    { label: 'En essai', value: metrics.trialSubscriptions, sub: `${metrics.expiredSubscriptions} expirés`, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Revenu estimé', value: `${metrics.totalRevenue.toLocaleString()} XOF`, sub: `${metrics.revenueThisMonth.toLocaleString()} XOF ce mois`, icon: CreditCard, color: 'text-blue-400' },
    { label: 'Produits', value: metrics.totalProducts, sub: `${metrics.lowStockProducts} en stock bas`, icon: Package, color: 'text-purple-400' },
    { label: 'Stock bas', value: metrics.lowStockProducts, sub: 'Alertes actives', icon: AlertTriangle, color: 'text-red-400' },
  ] : [];

  const shortcuts = [
    { label: 'Utilisateurs', url: '/ceo/users' },
    { label: 'Abonnements', url: '/ceo/subscriptions' },
    { label: 'Landing Page', url: '/ceo/landing' },
    { label: 'Paramètres', url: '/ceo/settings' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tableau de bord CEO</h2>
          <p className="text-sm text-slate-400">Vue d'ensemble de la plateforme Stocknix</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-white">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRIC_CARDS.map(m => (
          <div key={m.label} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{m.value}</p>
            <p className="text-[11px] text-slate-500">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Derniers inscrits</h3>
          <div className="space-y-3">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-xs font-bold">
                  {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.first_name || ''} {u.last_name || ''}</p>
                  <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-slate-600">{new Date(u.created_at).toLocaleDateString('fr')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent subs */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Derniers abonnements</h3>
          <div className="space-y-3">
            {recentSubs.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{s.email}</p>
                  <p className="text-[11px] text-slate-500">{s.plan_name || 'trial'}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.subscribed ? 'bg-emerald-500/10 text-emerald-400' : s.is_trial ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                  {s.subscribed ? 'Actif' : s.is_trial ? 'Essai' : 'Expiré'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shortcuts.map(s => (
          <button key={s.url} onClick={() => navigate(s.url)} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 text-left hover:border-teal-500/30 transition-all group">
            <span className="text-sm text-white font-medium">{s.label}</span>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-teal-400 mt-2 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
