import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const TARGETS = [
  { key: 'all', label: 'Tous les utilisateurs' },
  { key: 'subscribed', label: 'Abonnés actifs' },
  { key: 'trial', label: 'En essai' },
] as const;

const TEMPLATES = [
  { label: '🆕 Nouvelle fonctionnalité', subject: 'Nouvelle fonctionnalité disponible !', message: 'Bonjour,\n\nNous sommes ravis de vous annoncer une nouvelle fonctionnalité sur Stocknix.\n\nCordialement,\nL\'équipe Stocknix' },
  { label: '🔧 Maintenance', subject: 'Maintenance prévue', message: 'Bonjour,\n\nUne maintenance est prévue le [DATE]. Le service sera temporairement indisponible.\n\nMerci de votre compréhension.' },
  { label: '🎁 Promotion', subject: 'Offre spéciale Stocknix', message: 'Bonjour,\n\nProfitez de notre offre spéciale pour une durée limitée !\n\nCordialement,\nL\'équipe Stocknix' },
  { label: '⏰ Abonnement expirant', subject: 'Votre abonnement expire bientôt', message: 'Bonjour,\n\nVotre abonnement Stocknix arrive à expiration. Renouvelez-le pour continuer à profiter de nos services.\n\nCordialement' },
];

interface LogEntry { date: string; subject: string; target: string; count?: number }

export default function CeoNotifications() {
  const [target, setTarget] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ceo_notification_logs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Sujet et message requis'); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-send-mass-email', {
        body: { subject, message, notificationType: target },
      });
      if (error) throw error;
      toast.success(data?.message || 'Emails envoyés !');

      const newLog: LogEntry = { date: new Date().toISOString(), subject, target, count: data?.details?.total };
      const updated = [newLog, ...logs].slice(0, 20);
      setLogs(updated);
      localStorage.setItem('ceo_notification_logs', JSON.stringify(updated));
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setSubject(t.subject);
    setMessage(t.message);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">Emails & Notifications</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Target */}
          <div className="flex gap-2">
            {TARGETS.map(t => (
              <button key={t.key} onClick={() => setTarget(t.key)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${target === t.key ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500">Sujet</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white" placeholder="Sujet de l'email..." />
            </div>
            <div>
              <label className="text-xs text-slate-500">Message</label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white min-h-[200px]" placeholder="Contenu du message..." />
            </div>
            <Button onClick={handleSend} disabled={sending} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0 w-full">
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</> : <><Send className="h-4 w-4" /> Envoyer</>}
            </Button>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Templates</h3>
          <div className="space-y-2">
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => applyTemplate(t)} className="w-full text-left p-3 rounded-xl border border-slate-700/40 bg-slate-900/60 hover:border-teal-500/30 transition-all">
                <p className="text-sm text-white">{t.label}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.subject}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Historique d'envoi</h3>
          <div className="space-y-2">
            {logs.map((l, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-800/50 last:border-0">
                <div className="min-w-0">
                  <p className="text-white truncate">{l.subject}</p>
                  <p className="text-[11px] text-slate-500">{l.target} · {l.count || '?'} destinataires</p>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0">{new Date(l.date).toLocaleDateString('fr')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
