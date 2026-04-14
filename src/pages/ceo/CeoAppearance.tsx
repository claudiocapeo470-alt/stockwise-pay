import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Loader2, Palette, Eye } from 'lucide-react';

const DEFAULT_APPEARANCE = {
  primary_color: '#0A1A3B',
  secondary_color: '#3B82F6',
  accent_color: '#10B981',
  dark_mode_landing: false,
  hero_title: 'Gérez votre commerce en toute simplicité',
  hero_subtitle: 'Stocks, ventes, factures et analytics réunis dans une plateforme intuitive et puissante.',
  cta_text: 'Démarrer gratuitement',
};

export default function CeoAppearance() {
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFromDB();
  }, []);

  const loadFromDB = async () => {
    try {
      const { data } = await supabase.from('ceo_settings' as any).select('value').eq('key', 'appearance').single();
      if (data?.value) {
        setAppearance({ ...DEFAULT_APPEARANCE, ...(data.value as any) });
      }
    } catch { /* defaults */ }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await supabase.from('ceo_settings' as any).upsert(
        { key: 'appearance', value: appearance, updated_at: new Date().toISOString() } as any,
        { onConflict: 'key' }
      );
      toast.success('Apparence sauvegardée');
    } catch {
      toast.error('Erreur de sauvegarde');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-teal-400" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Palette className="h-6 w-6 text-teal-400" />
        <h2 className="text-xl font-bold text-white">Apparence</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Couleurs de la landing page</h3>
          
          {[
            { label: 'Couleur primaire', key: 'primary_color' },
            { label: 'Couleur secondaire', key: 'secondary_color' },
            { label: 'Couleur accent', key: 'accent_color' },
          ].map(c => (
            <div key={c.key} className="flex items-center gap-3">
              <input
                type="color"
                value={(appearance as any)[c.key]}
                onChange={e => setAppearance(a => ({ ...a, [c.key]: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
              />
              <div className="flex-1">
                <label className="text-xs text-slate-500">{c.label}</label>
                <Input
                  value={(appearance as any)[c.key]}
                  onChange={e => setAppearance(a => ({ ...a, [c.key]: e.target.value }))}
                  className="bg-slate-800/60 border-slate-700/40 text-white text-sm font-mono"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-300">Mode sombre landing</span>
            <Switch checked={appearance.dark_mode_landing} onCheckedChange={v => setAppearance(a => ({ ...a, dark_mode_landing: v }))} />
          </div>
        </div>

        {/* Textes Hero */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Textes du Hero</h3>
          
          <div>
            <label className="text-xs text-slate-500">Titre principal</label>
            <Input value={appearance.hero_title} onChange={e => setAppearance(a => ({ ...a, hero_title: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Sous-titre</label>
            <Input value={appearance.hero_subtitle} onChange={e => setAppearance(a => ({ ...a, hero_subtitle: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Texte du bouton CTA</label>
            <Input value={appearance.cta_text} onChange={e => setAppearance(a => ({ ...a, cta_text: e.target.value }))} className="bg-slate-800/60 border-slate-700/40 text-white" />
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl border border-slate-700/40" style={{ background: appearance.dark_mode_landing ? '#0f172a' : '#f8fafc' }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Aperçu</span>
            </div>
            <h4 className="text-sm font-bold" style={{ color: appearance.primary_color }}>{appearance.hero_title}</h4>
            <p className="text-[10px] mt-1" style={{ color: appearance.dark_mode_landing ? '#94a3b8' : '#64748b' }}>{appearance.hero_subtitle}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-lg text-[10px] font-semibold text-white" style={{ background: appearance.secondary_color }}>
              {appearance.cta_text}
            </div>
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="gap-2 bg-gradient-to-r from-teal-500 to-blue-600 border-0">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Sauvegarder l'apparence
      </Button>
    </div>
  );
}
