import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Boxes, Zap, Users, ShieldCheck, BarChart3, Headphones } from 'lucide-react';
import { useSubscriptionPricing } from '@/hooks/useSubscriptionPricing';
import type { PaiementProPlan } from '@/hooks/usePaiementPro';

type Benefit = { icon: any; title: string; desc: string };

export const PLAN_DEFS: {
  id: PaiementProPlan;
  name: string;
  tagline: string;
  accent: string;
  benefits: Benefit[];
}[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Commerçant solo',
    accent: 'text-success',
    benefits: [
      { icon: Boxes, title: 'Stock & Caisse', desc: "Jusqu'à 200 produits, caisse POS simple." },
      { icon: Users, title: '2 membres', desc: 'Partagez le travail avec un collaborateur.' },
      { icon: Headphones, title: 'Support email', desc: 'Une réponse sous 24 h ouvrées.' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'PME en croissance',
    accent: 'text-primary',
    benefits: [
      { icon: Boxes, title: 'Produits illimités', desc: 'Stock, factures et devis sans limite.' },
      { icon: Users, title: "10 membres d'équipe", desc: 'Rôles, permissions et suivi individuel.' },
      { icon: Zap, title: 'Support prioritaire', desc: 'Email + WhatsApp, réponse rapide.' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Franchises & multi-magasins',
    accent: 'text-accent-foreground',
    benefits: [
      { icon: BarChart3, title: 'Analytics avancés', desc: 'Prévisions et rapports multi-magasins.' },
      { icon: Users, title: 'Équipe illimitée', desc: "Jusqu'à 3 boutiques en ligne." },
      { icon: ShieldCheck, title: 'Support 24 h/7 j', desc: 'Gestionnaire dédié, SLA 99,9 %.' },
    ],
  },
];

interface Props {
  onSubscribe: (plan: PaiementProPlan, amount: number) => void;
  loadingPlan?: PaiementProPlan | null;
  ctaLabel?: string;
  note?: string;
}

export function SubscriptionPlansView({ onSubscribe, loadingPlan = null, ctaLabel = 'Commencer', note }: Props) {
  const { prices, isLoading } = useSubscriptionPricing();
  const [selected, setSelected] = useState<PaiementProPlan>('business');
  const plan = PLAN_DEFS.find(p => p.id === selected)!;
  const amount = prices?.[selected] ?? 0;

  const fmt = (n: number) => n.toLocaleString('de-DE').replace(/,/g, ' ');

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Titre + avantages dynamiques */}
      <div className="space-y-3">
        <div>
          <h1 className="text-[28px] leading-none font-extrabold tracking-tight">Abonnement</h1>
          <p className="text-xs font-semibold text-primary mt-1">Avantages inclus :</p>
        </div>
        <div className="space-y-3">
          {plan.benefits.map(b => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <b.icon className="h-[18px] w-[18px] text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{b.title}</p>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cartes défilables */}
      <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 w-max pb-1">
          {PLAN_DEFS.map(p => {
            const active = p.id === selected;
            const price = prices?.[p.id] ?? 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`w-[150px] shrink-0 rounded-3xl p-4 text-left transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                    : 'bg-card text-foreground shadow-sm'
                }`}
              >
                <p className={`text-xl font-extrabold ${active ? '' : p.accent}`}>{p.name}</p>
                <p className={`text-[11px] mt-0.5 ${active ? 'opacity-80' : 'text-muted-foreground'}`}>
                  {p.tagline}
                </p>
                <p className={`text-sm font-semibold mt-4 ${active ? '' : 'text-foreground'}`}>
                  {isLoading ? '…' : fmt(price)} XOF
                </p>
                <p className={`text-[11px] ${active ? 'opacity-75' : 'text-muted-foreground'}`}>par mois</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto space-y-2 text-center">
        {note && <p className="text-xs italic text-muted-foreground">{note}</p>}
        <Button
          size="lg"
          className="w-full h-12 rounded-2xl font-semibold"
          disabled={loadingPlan !== null || isLoading}
          onClick={() => onSubscribe(selected, amount)}
        >
          {loadingPlan === selected ? <Loader2 className="h-4 w-4 animate-spin" /> : `${ctaLabel} — ${plan.name}`}
        </Button>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Paiement sécurisé Mobile Money & carte bancaire. Sans engagement, annulable à tout moment.
        </p>
      </div>
    </div>
  );
}
