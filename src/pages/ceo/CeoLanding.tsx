import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink, RotateCcw, Save } from 'lucide-react';

const TABS = ['Hero', 'Tarifs', 'CTA', 'Contact & Footer'] as const;

const DEFAULT_CONTENT = {
  hero_badge: '🚀 +2000 entrepreneurs nous font confiance',
  hero_title: 'Gérez votre stock intelligemment',
  hero_subtitle: 'La solution tout-en-un pour les PME africaines',
  hero_cta_primary: 'Commencer gratuitement',
  hero_cta_secondary: 'Voir la démo',
  social_proof_count: '2000+',
  social_proof_text: 'entrepreneurs actifs',
  plan_starter_name: 'Starter', plan_starter_price: '9 900', plan_starter_features: 'Stock de base\nVentes\nTableau de bord',
  plan_business_name: 'Business', plan_business_price: '24 900', plan_business_features: 'Tout Starter\nFacturation\nBoutique en ligne\nÉquipe',
  plan_pro_name: 'Pro', plan_pro_price: '49 900', plan_pro_features: 'Tout Business\nMulti-boutiques\nAPI\nSupport prioritaire',
  cta_title: 'Prêt à transformer votre gestion ?',
  cta_subtitle: 'Rejoignez des milliers d\'entrepreneurs africains',
  cta_button: 'Commencer maintenant',
  contact_email: 'support@stocknix.com',
  contact_whatsapp: '+228 70 00 00 00',
  footer_copyright: '© 2025 Stocknix. Tous droits réservés.',
};

type ContentKey = keyof typeof DEFAULT_CONTENT;

export default function CeoLanding() {
  const [tab, setTab] = useState<typeof TABS[number]>('Hero');
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const saved = localStorage.getItem('ceo_landing_content');
    if (saved) setContent({ ...DEFAULT_CONTENT, ...JSON.parse(saved) });
  }, []);

  const update = (key: ContentKey, value: string) => setContent(c => ({ ...c, [key]: value }));

  const handleSave = () => {
    localStorage.setItem('ceo_landing_content', JSON.stringify(content));
    toast.success('Contenu sauvegardé !');
  };

  const handleReset = () => {
    localStorage.removeItem('ceo_landing_content');
    setContent(DEFAULT_CONTENT);
    toast.success('Contenu réinitialisé');
  };

  const Field = ({ label, k, multiline }: { label: string; k: ContentKey; multiline?: boolean }) => (
    <div className="space-y-1.5">
      <label className="text-xs text-slate-500">{label}</label>
      {multiline
        ? <Textarea value={content[k]} onChange={e => update(k, e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white min-h-[80px]" />
        : <Input value={content[k]} onChange={e => update(k, e.target.value)} className="bg-slate-800/60 border-slate-700/40 text-white" />
      }
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Landing Page</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')} className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" /> Voir le site
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-slate-800/60 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0">
            <Save className="h-3.5 w-3.5" /> Sauvegarder
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${tab === t ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 space-y-5">
          {tab === 'Hero' && <>
            <Field label="Badge" k="hero_badge" />
            <Field label="Titre principal" k="hero_title" />
            <Field label="Sous-titre" k="hero_subtitle" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA primaire" k="hero_cta_primary" />
              <Field label="CTA secondaire" k="hero_cta_secondary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre (social proof)" k="social_proof_count" />
              <Field label="Texte (social proof)" k="social_proof_text" />
            </div>
          </>}
          {tab === 'Tarifs' && <>
            {(['starter', 'business', 'pro'] as const).map(plan => (
              <div key={plan} className="space-y-3 pb-4 border-b border-slate-800 last:border-0">
                <p className="text-sm font-semibold text-white capitalize">{plan}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom" k={`plan_${plan}_name` as ContentKey} />
                  <Field label="Prix (XOF)" k={`plan_${plan}_price` as ContentKey} />
                </div>
                <Field label="Fonctionnalités (une par ligne)" k={`plan_${plan}_features` as ContentKey} multiline />
              </div>
            ))}
          </>}
          {tab === 'CTA' && <>
            <Field label="Titre CTA" k="cta_title" />
            <Field label="Sous-titre CTA" k="cta_subtitle" />
            <Field label="Bouton CTA" k="cta_button" />
          </>}
          {tab === 'Contact & Footer' && <>
            <Field label="Email de contact" k="contact_email" />
            <Field label="WhatsApp" k="contact_whatsapp" />
            <Field label="Copyright" k="footer_copyright" />
          </>}
        </div>
      </div>
    </div>
  );
}
