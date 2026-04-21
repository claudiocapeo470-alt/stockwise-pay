import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Loader2, ExternalLink } from 'lucide-react';

const TABS = ['Plateforme', 'Tarifs', 'Sécurité', 'Notifications', 'Base de données'] as const;

const DB_TABLES = ['profiles', 'subscribers', 'products', 'sales', 'user_roles', 'payment_history', 'company_members', 'companies', 'invoices'];

const DEFAULT_PLATFORM = {
  site_name: 'Stocknix', site_url: 'https://stocknix.com', support_email: 'support@stocknix.com',
  whatsapp: '+228 70 00 00 00', trial_days: '14', max_products: '500',
  maintenance_mode: false, allow_new_registrations: true, email_confirmation_required: true,
};

const DEFAULT_NOTIF = {
  notify_new_user: true, notify_new_subscription: true, notify_expiring_soon: true, notify_payment_failed: true,
  expiry_warning_days: '7',
};

const DEFAULT_PRICING = { starter: 9900, business: 24900, pro: 49900 };
const PRICING_FIELDS: { key: 'starter' | 'business' | 'pro'; label: string; description: string }[] = [
  { key: 'starter', label: 'Starter', description: 'Petits commerçants solo' },
  { key: 'business', label: 'Business', description: 'PME en croissance' },
  { key: 'pro', label: 'Pro', description: 'Grandes structures' },
];
const formatXof = (n: number) => Number.isFinite(n) ? n.toLocaleString('fr-FR').replace(/,/g, ' ') : '0';

export default function CeoSettings() {
  const [tab, setTab] = useState<typeof TABS[number]>('Plateforme');
  const [platform, setPlatform] = useState(DEFAULT_PLATFORM);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIF);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [savingPricing, setSavingPricing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromDB();
  }, []);

  const loadFromDB = async () => {
    try {
      const { data } = await supabase.from('ceo_settings' as any).select('key, value');
      if (data && Array.isArray(data)) {
        const map: Record<string, any> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        if (map.platform) setPlatform({ ...DEFAULT_PLATFORM, ...map.platform });
        if (map.notifications) setNotifSettings({ ...DEFAULT_NOTIF, ...map.notifications });
        if (map.subscription_pricing) {
          const p = map.subscription_pricing;
          setPricing({
            starter: Number(p.starter) || DEFAULT_PRICING.starter,
            business: Number(p.business) || DEFAULT_PRICING.business,
            pro: Number(p.pro) || DEFAULT_PRICING.pro,
          });
        }
      }
    } catch {
      // fallback to defaults
    }
    setLoading(false);
  };

  const saveToDB = async (key: string, value: any) => {
    try {
      await supabase.from('ceo_settings' as any).upsert(
        { key, value, updated_at: new Date().toISOString() } as any,
        { onConflict: 'key' }
      );
    } catch {
      // silent
    }
  };

  const savePlatform = async () => {
    await saveToDB('platform', platform);
    toast.success('Paramètres sauvegardés');
  };

  const changePassword = async () => {
    if (!currentPassword) { toast.error('Entrez le mot de passe actuel'); return; }
    if (newPassword.length < 8) { toast.error('8 caractères minimum'); return; }
    if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setChangingPw(true);
    
    // Re-authenticate first
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) { toast.error('Erreur de session'); setChangingPw(false); return; }
    
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email, password: currentPassword
    });
    if (reAuthError) { toast.error('Mot de passe actuel incorrect'); setChangingPw(false); return; }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success('Mot de passe mis à jour'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    setChangingPw(false);
  };

  const saveNotif = async () => {
    await saveToDB('notifications', notifSettings);
    toast.success('Préférences sauvegardées');
  };

  const savePricing = async () => {
    for (const f of PRICING_FIELDS) {
      const v = pricing[f.key];
      if (!Number.isInteger(v) || v < 100) {
        toast.error(`Le prix du plan ${f.label} doit être un entier ≥ 100 FCFA`);
        return;
      }
    }
    setSavingPricing(true);
    try {
      await saveToDB('subscription_pricing', pricing);
      toast.success('Tarifs mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingPricing(false);
    }
  };

  const resetPricing = () => {
    setPricing({ ...DEFAULT_PRICING });
    toast.info('Valeurs par défaut restaurées (non sauvegardées)');
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-teal-400" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">Paramètres</h2>

      {/* Tabs - responsive */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex sm:flex-col sm:w-48 shrink-0 gap-1 overflow-x-auto sm:overflow-x-visible">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap sm:w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${tab === t ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 sm:p-6 space-y-5">
          {tab === 'Plateforme' && <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nom du site', key: 'site_name' },
                { label: 'URL du site', key: 'site_url' },
                { label: 'Email support', key: 'support_email' },
                { label: 'WhatsApp', key: 'whatsapp' },
                { label: 'Jours d\'essai', key: 'trial_days' },
                { label: 'Max produits/plan', key: 'max_products' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-500">{f.label}</label>
                  <Input value={(platform as any)[f.key]} onChange={e => setPlatform((p: any) => ({ ...p, [f.key]: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              {[
                { label: 'Mode maintenance', key: 'maintenance_mode' },
                { label: 'Nouvelles inscriptions', key: 'allow_new_registrations' },
                { label: 'Confirmation email requise', key: 'email_confirmation_required' },
              ].map(t => (
                <div key={t.key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{t.label}</span>
                  <Switch checked={(platform as any)[t.key]} onCheckedChange={v => setPlatform((p: any) => ({ ...p, [t.key]: v }))} />
                </div>
              ))}
            </div>
            <Button onClick={savePlatform} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0"><Save className="h-4 w-4" /> Sauvegarder</Button>
          </>}

          {tab === 'Sécurité' && <>
            <p className="text-sm text-slate-400">Changer le mot de passe du compte CEO</p>
            <div className="space-y-3 max-w-sm">
              <div>
                <label className="text-xs text-slate-500">Mot de passe actuel</label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white" placeholder="Entrez votre mot de passe actuel" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Nouveau mot de passe</label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Confirmer</label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white" />
              </div>
              <Button onClick={changePassword} disabled={changingPw} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0">
                {changingPw ? <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour...</> : 'Mettre à jour'}
              </Button>
            </div>
            <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-sm font-medium text-red-400">⚠️ Zone dangereuse</p>
              <p className="text-xs text-slate-500 mt-1">Vous devez entrer votre mot de passe actuel avant de le modifier.</p>
            </div>
          </>}

          {tab === 'Notifications' && <>
            <div className="space-y-3">
              {[
                { label: 'Nouvel utilisateur inscrit', key: 'notify_new_user' },
                { label: 'Nouvel abonnement', key: 'notify_new_subscription' },
                { label: 'Abonnement expirant', key: 'notify_expiring_soon' },
                { label: 'Paiement échoué', key: 'notify_payment_failed' },
              ].map(t => (
                <div key={t.key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{t.label}</span>
                  <Switch checked={(notifSettings as any)[t.key]} onCheckedChange={v => setNotifSettings((s: any) => ({ ...s, [t.key]: v }))} />
                </div>
              ))}
              <div className="pt-2">
                <label className="text-xs text-slate-500">Jours d'alerte avant expiration</label>
                <Input type="number" value={notifSettings.expiry_warning_days} onChange={e => setNotifSettings((s: any) => ({ ...s, expiry_warning_days: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white w-24" />
              </div>
            </div>
            <Button onClick={saveNotif} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0"><Save className="h-4 w-4" /> Sauvegarder</Button>
          </>}

          {tab === 'Base de données' && <>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500">Projet ID</label><p className="text-sm text-white font-mono">fsdfzzhbydlmuiblgkvb</p></div>
                <div><label className="text-xs text-slate-500">Région</label><p className="text-sm text-white">eu-west-2</p></div>
              </div>
              <div><label className="text-xs text-slate-500">URL Supabase</label><p className="text-sm text-white font-mono text-[11px] break-all">https://fsdfzzhbydlmuiblgkvb.supabase.co</p></div>
              <div className="pt-2">
                <label className="text-xs text-slate-500 mb-2 block">Tables principales</label>
                <div className="flex flex-wrap gap-2">
                  {DB_TABLES.map(t => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/60 text-slate-300 font-mono">{t}</span>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open('https://supabase.com/dashboard/project/fsdfzzhbydlmuiblgkvb', '_blank')} className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:text-white mt-3">
                <ExternalLink className="h-3.5 w-3.5" /> Ouvrir Supabase Dashboard
              </Button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
