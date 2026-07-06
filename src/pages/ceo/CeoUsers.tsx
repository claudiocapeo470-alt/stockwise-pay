import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Edit2, Trash2, Shield, Clock, Loader2, Download } from 'lucide-react';
import { useCeoUsers, useCeoUpdateUser, useCeoGiveTrial, useCeoToggleRole, useCeoDeleteUser } from '@/hooks/useCeo';

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
  const { data: users = [], isLoading } = useCeoUsers();
  const updateUser = useCeoUpdateUser();
  const giveTrial = useCeoGiveTrial();
  const toggleRole = useCeoToggleRole();
  const deleteUser = useCeoDeleteUser();

  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', company_name: '' });

  const filtered = (users as UserRow[]).filter(u => {
    const q = search.toLowerCase();
    return !q || [u.email, u.first_name, u.last_name, u.company_name].some(f => f?.toLowerCase().includes(q));
  });

  const handleEdit = (u: UserRow) => {
    setEditUser(u);
    setEditForm({ first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '', company_name: u.company_name || '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    await updateUser.mutateAsync({
      user_id: editUser.user_id,
      first_name: editForm.first_name || null,
      last_name: editForm.last_name || null,
      company_name: editForm.company_name || null,
    });
    setEditUser(null);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-teal-400 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Utilisateurs</h2>
          <p className="text-sm text-slate-400">{users.length} utilisateurs inscrits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const headers = ['Email', 'Prénom', 'Nom', 'Entreprise', 'Rôle', 'Plan', 'Date inscription'];
            const rows = filtered.map(u => [u.email || '', u.first_name || '', u.last_name || '', u.company_name || '', u.role || 'user', u.plan_name || 'Aucun', new Date(u.created_at).toLocaleDateString('fr')]);
            const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `stocknix-users-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }} className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:text-white">
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input className="pl-9 bg-slate-800/60 border-slate-700/40 text-white placeholder:text-slate-600" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
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
                      <button onClick={() => giveTrial.mutate({ user_id: u.user_id, email: u.email || '' })} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400" title="14j essai"><Clock className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toggleRole.mutate({ user_id: u.user_id, currentRole: u.role || 'user' })} className="p-1.5 rounded-lg hover:bg-purple-500/10 text-slate-400 hover:text-purple-400" title="Toggle admin"><Shield className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) deleteUser.mutate(u.user_id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            <Button onClick={handleSaveEdit} disabled={updateUser.isPending} className="bg-gradient-to-r from-teal-500 to-blue-600 border-0">{updateUser.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
