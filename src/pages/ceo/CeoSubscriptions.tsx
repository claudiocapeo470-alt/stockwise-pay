import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Ban, Loader2, Download } from 'lucide-react';

type Sub = {
  id: string; email: string; user_id: string | null; plan_name: string | null; subscribed: boolean;
  is_trial: boolean | null; trial_ends_at: string | null; subscription_end: string | null;
  plan_price: number | null; created_at: string;
};

function getStatus(s: Sub) {
  const now = new Date();
  if (s.is_trial && s.trial_ends_at && new Date(s.trial_ends_at) > now) return 'trial';
  if (s.subscribed && s.subscription_end && new Date(s.subscription_end) > now) return 'active';
  return 'expired';
}

function daysLeft(dateStr: string | null) {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

const PLANS = [
  { name: 'trial', label: 'Essai (14j)', days: 14, price: 0 },
  { name: 'starter', label: 'Starter (1 mois)', days: 30, price: 9900 },
  { name: 'business', label: 'Business (1 mois)', days: 30, price: 24900 },
  { name: 'pro', label: 'Pro (1 mois)', days: 30, price: 49900 },
];

export default function CeoSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [changePlanSub, setChangePlanSub] = useState<Sub | null>(null);

  const fetchSubs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setSubs((data as Sub[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const filtered = subs.filter(s => {
    const st = getStatus(s);
    if (statusFilter !== 'all' && st !== statusFilter) return false;
    if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    active: subs.filter(s => getStatus(s) === 'active').length,
    trial: subs.filter(s => getStatus(s) === 'trial').length,
    expired: subs.filter(s => getStatus(s) === 'expired').length,
    revenue: subs.filter(s => s.subscribed).reduce((sum, s) => sum + (s.plan_price || 0), 0),
  };

  const extendDays = async (sub: Sub, days: number) => {
    const base = sub.subscription_end && new Date(sub.subscription_end) > new Date() ? new Date(sub.subscription_end) : new Date();
    const newEnd = new Date(base.getTime() + days * 86400000).toISOString();
    const { error } = await supabase.from('subscribers').update({ subscription_end: newEnd, subscribed: true }).eq('id', sub.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`+${days} jours accordés`);
    fetchSubs();
  };

  const changePlan = async (sub: Sub, plan: typeof PLANS[0]) => {
    const newEnd = new Date(Date.now() + plan.days * 86400000).toISOString();
    const { error } = await supabase.from('subscribers').update({
      plan_name: plan.name, plan_price: plan.price, subscription_end: newEnd,
      subscribed: true, is_trial: plan.name === 'trial',
      trial_ends_at: plan.name === 'trial' ? newEnd : null,
    }).eq('id', sub.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Plan changé en ${plan.label}`);
    setChangePlanSub(null);
    fetchSubs();
  };

  const deactivate = async (sub: Sub) => {
    const { error } = await supabase.from('subscribers').update({ subscribed: false, is_trial: false }).eq('id', sub.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Abonnement désactivé');
    fetchSubs();
  };

  const statusBadge = (s: Sub) => {
    const st = getStatus(s);
    const cls = st === 'active' ? 'bg-emerald-500/10 text-emerald-400' : st === 'trial' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400';
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${cls}`}>{st === 'active' ? 'Actif' : st === 'trial' ? 'Essai' : 'Expiré'}</span>;
  };

  const daysLeftBadge = (s: Sub) => {
    const d = daysLeft(s.subscription_end || s.trial_ends_at);
    const cls = d > 7 ? 'text-emerald-400' : d > 0 ? 'text-yellow-400' : 'text-red-400';
    return <span className={`text-xs font-medium ${cls}`}>{d}j</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-teal-400 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Abonnements</h2>
        <Button variant="outline" size="sm" onClick={() => {
          const headers = ['Email', 'Plan', 'Statut', 'Prix', 'Fin abonnement', 'Date création'];
          const rows = filtered.map(s => [s.email, s.plan_name || '—', getStatus(s), s.plan_price?.toString() || '0', s.subscription_end ? new Date(s.subscription_end).toLocaleDateString('fr') : '—', new Date(s.created_at).toLocaleDateString('fr')]);
          const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
          const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `stocknix-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
          URL.revokeObjectURL(url);
        }} className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:text-white">
          <Download className="h-4 w-4" /> Exporter CSV
        </Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Actifs', value: stats.active, cls: 'text-emerald-400' },
          { label: 'Essai', value: stats.trial, cls: 'text-yellow-400' },
          { label: 'Expirés', value: stats.expired, cls: 'text-red-400' },
          { label: 'Revenu estimé', value: `${stats.revenue.toLocaleString()} XOF`, cls: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-800/60 border border-slate-700/40 text-white rounded-lg px-3 py-2 text-sm">
          <option value="all">Tous</option><option value="active">Actifs</option><option value="trial">Essai</option><option value="expired">Expirés</option>
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input className="pl-9 bg-slate-800/60 border-slate-700/40 text-white placeholder:text-slate-600" placeholder="Rechercher email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left p-4 text-slate-500 font-medium">Email</th>
            <th className="text-left p-4 text-slate-500 font-medium">Plan</th>
            <th className="text-left p-4 text-slate-500 font-medium">Statut</th>
            <th className="text-left p-4 text-slate-500 font-medium">Jours restants</th>
            <th className="text-right p-4 text-slate-500 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 text-white">{s.email}</td>
                <td className="p-4 text-slate-400">{s.plan_name || '—'}</td>
                <td className="p-4">{statusBadge(s)}</td>
                <td className="p-4">{daysLeftBadge(s)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => extendDays(s, 7)} className="px-2 py-1 text-[10px] rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">+7j</button>
                    <button onClick={() => extendDays(s, 30)} className="px-2 py-1 text-[10px] rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">+30j</button>
                    <button onClick={() => setChangePlanSub(s)} className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white" title="Changer plan"><Plus className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deactivate(s)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Désactiver"><Ban className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Change plan dialog */}
      <Dialog open={!!changePlanSub} onOpenChange={v => !v && setChangePlanSub(null)}>
        <DialogContent className="bg-slate-900 border-slate-700/40 text-white">
          <DialogHeader><DialogTitle>Changer le plan</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {PLANS.map(p => (
              <button key={p.name} onClick={() => changePlanSub && changePlan(changePlanSub, p)} className="w-full p-3 rounded-xl border border-slate-700/40 hover:border-teal-500/30 text-left flex items-center justify-between transition-all">
                <div><p className="text-sm text-white font-medium">{p.label}</p><p className="text-[11px] text-slate-500">{p.price > 0 ? `${p.price.toLocaleString()} XOF` : 'Gratuit'}</p></div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
