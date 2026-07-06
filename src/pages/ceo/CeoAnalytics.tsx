import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useCeoAnalytics } from '@/hooks/useCeo';

export default function CeoAnalytics() {
  const { data, isLoading } = useCeoAnalytics();

  const { kpis, usersByMonth, planDist, revenueByMonth } = useMemo(() => {
    const empty = { kpis: { totalUsers: 0, activeSubs: 0, totalRevenue: 0, avgRevenue: 0 }, usersByMonth: [] as any[], planDist: [] as any[], revenueByMonth: [] as any[] };
    if (!data) return empty;
    const { profiles, subs, sales } = data;
    const totalUsers = profiles.length;
    const active = subs.filter((s: any) => s.subscribed);
    const totalRev = active.reduce((s: number, x: any) => s + (x.plan_price || 0), 0);
    const kpis = { totalUsers, activeSubs: active.length, totalRevenue: totalRev, avgRevenue: active.length > 0 ? Math.round(totalRev / active.length) : 0 };

    const now = new Date();
    const usersByMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr', { month: 'short', year: '2-digit' });
      usersByMonth.push({ month: label, count: profiles.filter((p: any) => p.created_at.startsWith(key)).length });
    }

    const planCounts: Record<string, number> = {};
    subs.forEach((s: any) => { const p = s.plan_name || 'aucun'; planCounts[p] = (planCounts[p] || 0) + 1; });
    const total = subs.length || 1;
    const planDist = Object.entries(planCounts).map(([plan, count]) => ({ plan, count, pct: Math.round((count / total) * 100) }));

    const revenueByMonth: { month: string; amount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr', { month: 'short', year: '2-digit' });
      revenueByMonth.push({ month: label, amount: sales.filter((s: any) => s.sale_date.startsWith(key)).reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0) });
    }
    return { kpis, usersByMonth, planDist, revenueByMonth };
  }, [data]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-teal-400 animate-spin" /></div>;

  const maxUsers = Math.max(...usersByMonth.map(m => m.count), 1);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-white">Analytics</h2>

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
