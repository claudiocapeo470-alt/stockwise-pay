import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Edit2, Trash2, Shield, Clock, Loader2 } from 'lucide-react';

interface UserRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company_name: string | null;
  created_at: string;
  role?: string;
  plan_name?: string | null;
  subscribed?: boolean;
}

export default function CeoUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', company_name: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [{ data: profiles }, { data: roles }, { data: subs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('subscribers').select('user_id, plan_name, subscribed'),
      ]);

      const rolesMap = new Map((roles || []).map(r => [r.user_id, r.role]));
      const subsMap = new Map((subs || []).map(s => [s.user_id, s]));

      setUsers((profiles || []).map(p => ({
        ...p,
        role: rolesMap.get(p.user_id) || 'user',
        plan_name: subsMap.get(p.user_id)?.plan_name,
        subscribed: subsMap.get(p.user_id)?.subscribed,
      })));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || [u.email, u.first_name, u.last_name, u.company_name].some(f => f?.toLowerCase().includes(q));
  });

  const handleEdit = (u: UserRow) => {
    setEditUser(u);
    setEditForm({ first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '', company_name: u.company_name || '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        company_name: editForm.company_name || null,
      }).eq('user_id', editUser.user_id);
      toast.success('Utilisateur mis à jour');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const giveTrialDays = async (userId: string, email: string) => {
    const trialEnd = new Date(Date.now() + 14 * 86400000).toISOString();
    const { error } = await supabase.from('subscribers').upsert({
      user_id: userId,
      email,
      is_trial: true,
      subscribed: true,
      trial_ends_at: trialEnd,
      subscription_end: trialEnd,
      plan_name: 'trial',
    }, { onConflict: 'user_id' });
    if (error) { toast.error(error.message); return; }
    toast.success('14 jours d\'essai accordés');
    fetchUsers();
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('user_roles').upsert(
      { user_id: userId, role: newRole as any },
      { onConflict: 'user_id,role' }
    );
    if (error) { toast.error(error.message); return; }
    toast.success(`Rôle changé en ${newRole}`);
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) { toast.error(error.message); return; }
    toast.success('Utilisateur supprimé');
    fetchUsers();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-teal-400 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Utilisateurs</h2>
          <p className="text-sm text-slate-400">{users.length} utilisateurs inscrits</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input className="pl-9 bg-slate-800/60 border-slate-700/40 text-white placeholder:text-slate-600" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-500 font-medium">Utilisateur</th>
                <th className="text-left p-4 text-slate-500 font-medium">Entreprise</th>
                <th className="text-left p-4 text-slate-500 font-medium">Abonnement</th>
                <th className="text-left p-4 text-slate-500 font-medium">Rôle</th>
                <th className="text-left p-4 text-slate-500 font-medium">Date</th>
                <th className="text-right p-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
                        {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white truncate">{u.first_name || ''} {u.last_name || ''}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{u.company_name || '—'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.subscribed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/40 text-slate-400'}`}>
                      {u.plan_name || 'Aucun'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700/40 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('fr')}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white" title="Modifier"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => giveTrialDays(u.user_id, u.email || '')} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400" title="14j essai"><Clock className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toggleRole(u.user_id, u.role || 'user')} className="p-1.5 rounded-lg hover:bg-purple-500/10 text-slate-400 hover:text-purple-400" title="Toggle admin"><Shield className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteUser(u.user_id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-700/40 text-white">
          <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-500">Prénom</label><Input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" /></div>
              <div><label className="text-xs text-slate-500">Nom</label><Input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" /></div>
            </div>
            <div><label className="text-xs text-slate-500">Entreprise</label><Input value={editForm.company_name} onChange={e => setEditForm(f => ({ ...f, company_name: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} className="border-slate-700 text-slate-300">Annuler</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-gradient-to-r from-teal-500 to-blue-600 border-0">{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
