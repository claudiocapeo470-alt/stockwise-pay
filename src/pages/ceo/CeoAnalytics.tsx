import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CeoAnalytics() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalUsers: 0, activeSubs: 0, totalRevenue: 0, avgRevenue: 0 });
  const [usersByMonth, setUsersByMonth] = useState<{ month: string; count: number }[]>([]);
  const [planDist, setPlanDist] = useState<{ plan: string; count: number; pct: number }[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; amount: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [{ data: profiles }, { data: subs }, { data: sales }] = await Promise.all([
          supabase.from('profiles').select('created_at'),
          supabase.from('subscribers').select('plan_name, plan_price, subscribed'),
          supabase.from('sales').select('total_amount, sale_date'),
        ]);

        const totalUsers = profiles?.length || 0;
        const subsData = subs || [];
        const active = subsData.filter(s => s.subscribed);
        const totalRev = active.reduce((s, x) => s + (x.plan_price || 0), 0);

        setKpis({
          totalUsers,
          activeSubs: active.length,
          totalRevenue: totalRev,
          avgRevenue: active.length > 0 ? Math.round(totalRev / active.length) : 0,
        });

        // Users by month (last 6)
        const now = new Date();
        const months: { month: string; count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('fr', { month: 'short', year: '2-digit' });
          const count = (profiles || []).filter(p => p.created_at.startsWith(key)).length;
          months.push({ month: label, count });
        }
        setUsersByMonth(months);

        // Plan distribution
        const planCounts: Record<string, number> = {};
        subsData.forEach(s => { const p = s.plan_name || 'aucun'; planCounts[p] = (planCounts[p] || 0) + 1; });
        const total = subsData.length || 1;
        setPlanDist(Object.entries(planCounts).map(([plan, count]) => ({ plan, count, pct: Math.round((count / total) * 100) })));

        // Revenue by month (last 12)
        const revMonths: { month: string; amount: number }[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('fr', { month: 'short', year: '2-digit' });
          const amount = (sales || []).filter(s => s.sale_date.startsWith(key)).reduce((sum, s) => sum + (s.total_amount || 0), 0);
          revMonths.push({ month: label, amount });
        }
        setRevenueByMonth(revMonths);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-teal-400 animate-spin" /></div>;

  const maxUsers = Math.max(...usersByMonth.map(m => m.count), 1);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-white">Analytics</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total users', value: kpis.totalUsers, cls: 'text-teal-400' },
          { label: 'Abonnés actifs', value: kpis.activeSubs, cls: 'text-emerald-400' },
          { label: 'Revenu total', value: `${kpis.totalRevenue.toLocaleString()} XOF`, cls: 'text-blue-400' },
          { label: 'Revenu moyen/abonné', value: `${kpis.avgRevenue.toLocaleString()} XOF`, cls: 'text-purple-400' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4">
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className={`text-xl font-bold ${k.cls}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users chart */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Inscriptions (6 derniers mois)</h3>
          <div className="flex items-end gap-3 h-28">
            {usersByMonth.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-teal-400 font-medium">{m.count}</span>
                <div className="w-full bg-teal-500/20 rounded-t-md" style={{ height: `${(m.count / maxUsers) * 96}px`, minHeight: 4 }} />
                <span className="text-[9px] text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan dist */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Distribution des plans</h3>
          <div className="space-y-3">
            {planDist.map(p => (
              <div key={p.plan} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 capitalize">{p.plan}</span>
                  <span className="text-slate-500">{p.count} ({p.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue table */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Revenus par mois (ventes)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              <th className="text-left p-3 text-slate-500 font-medium">Mois</th>
              <th className="text-right p-3 text-slate-500 font-medium">Montant (XOF)</th>
            </tr></thead>
            <tbody>
              {revenueByMonth.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="p-3 text-slate-300">{r.month}</td>
                  <td className="p-3 text-right text-white font-medium">{r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
