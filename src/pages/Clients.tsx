import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { Plus, Search, Users, Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  total_spent: number;
  loyalty_points: number;
  created_at: string;
}

export default function Clients() {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const { formatCurrency } = useCurrency();
  const isMobile = useIsMobile();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', address: '', notes: '' });

  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  const fetchClients = async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false });
    setClients((data as Client[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [effectiveUserId]);

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name || ''} ${c.phone || ''} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditClient(null);
    setForm({ first_name: '', last_name: '', phone: '', email: '', address: '', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({ first_name: c.first_name, last_name: c.last_name || '', phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.first_name.trim() || !effectiveUserId) return;
    try {
      if (editClient) {
        await supabase.from('customers').update({
          first_name: form.first_name, last_name: form.last_name || null,
          phone: form.phone || null, email: form.email || null,
          address: form.address || null, notes: form.notes || null,
        }).eq('id', editClient.id);
        toast.success('Client mis à jour');
      } else {
        await supabase.from('customers').insert({
          user_id: effectiveUserId,
          first_name: form.first_name, last_name: form.last_name || null,
          phone: form.phone || null, email: form.email || null,
          address: form.address || null, notes: form.notes || null,
        });
        toast.success('Client ajouté');
      }
      setDialogOpen(false);
      fetchClients();
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    toast.success('Client supprimé');
    fetchClients();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Clients</h1>
        <Button onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{clients.length}</p><p className="text-xs text-muted-foreground">Total clients</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(clients.reduce((s, c) => s + (c.total_spent || 0), 0))}</p><p className="text-xs text-muted-foreground">CA total</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><h3 className="font-semibold mb-1">{clients.length === 0 ? 'Aucun client' : 'Aucun résultat'}</h3><p className="text-sm text-muted-foreground">{clients.length === 0 ? 'Ajoutez votre premier client' : ''}</p></CardContent></Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="cursor-pointer" onClick={() => openEdit(c)}>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-sm">{c.first_name[0]}{(c.last_name || '')[0] || ''}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.first_name} {c.last_name || ''}</p>
                  <p className="text-xs text-muted-foreground">{c.phone || c.email || '—'}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(c.total_spent || 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total dépensé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{c.first_name[0]}{(c.last_name || '')[0] || ''}</AvatarFallback></Avatar><span className="font-medium">{c.first_name} {c.last_name || ''}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{c.phone || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(c.total_spent || 0)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prénom *</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
              <div><Label>Nom</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+225 07..." /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.first_name.trim()}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
