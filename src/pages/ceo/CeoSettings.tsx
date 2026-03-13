import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Loader2, ExternalLink } from 'lucide-react';

const TABS = ['Plateforme', 'Sécurité', 'Notifications', 'Base de données'] as const;

const DB_TABLES = ['profiles', 'subscribers', 'products', 'sales', 'user_roles', 'payment_history', 'company_members', 'companies', 'invoices'];

export default function CeoSettings() {
  const [tab, setTab] = useState<typeof TABS[number]>('Plateforme');

  // Platform
  const [platform, setPlatform] = useState(() => {
    const saved = localStorage.getItem('ceo_platform_settings');
    return saved ? JSON.parse(saved) : {
      site_name: 'Stocknix', site_url: 'https://stocknix.lovable.app', support_email: 'support@stocknix.com',
      whatsapp: '+228 70 00 00 00', trial_days: '14', max_products: '500',
      maintenance_mode: false, allow_new_registrations: true, email_confirmation_required: true,
    };
  });

  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  // Notif settings
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('ceo_notif_settings');
    return saved ? JSON.parse(saved) : {
      notify_new_user: true, notify_new_subscription: true, notify_expiring_soon: true, notify_payment_failed: true,
      expiry_warning_days: '7',
    };
  });

  const savePlatform = () => {
    localStorage.setItem('ceo_platform_settings', JSON.stringify(platform));
    toast.success('Paramètres sauvegardés');
  };

  const changePassword = async () => {
    if (newPassword.length < 8) { toast.error('8 caractères minimum'); return; }
    if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success('Mot de passe mis à jour'); setNewPassword(''); setConfirmPassword(''); }
    setChangingPw(false);
  };

  const saveNotif = () => {
    localStorage.setItem('ceo_notif_settings', JSON.stringify(notifSettings));
    toast.success('Préférences sauvegardées');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">Paramètres</h2>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${tab === t ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 space-y-5">
          {tab === 'Plateforme' && <>
            <div className="grid grid-cols-2 gap-4">
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
                  <Input value={platform[f.key]} onChange={e => setPlatform((p: any) => ({ ...p, [f.key]: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" />
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
                  <Switch checked={platform[t.key]} onCheckedChange={v => setPlatform((p: any) => ({ ...p, [t.key]: v }))} />
                </div>
              ))}
            </div>
            <Button onClick={savePlatform} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0"><Save className="h-4 w-4" /> Sauvegarder</Button>
          </>}

          {tab === 'Sécurité' && <>
            <p className="text-sm text-slate-400">Changer le mot de passe du compte CEO</p>
            <div className="space-y-3 max-w-sm">
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
              <p className="text-xs text-slate-500 mt-1">Le changement de mot de passe s'applique immédiatement au compte support@stocknix.com</p>
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
                  <Switch checked={notifSettings[t.key]} onCheckedChange={v => setNotifSettings((s: any) => ({ ...s, [t.key]: v }))} />
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
              <div className="grid grid-cols-2 gap-3">
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
