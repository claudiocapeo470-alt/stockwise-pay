import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialDaysLeft: number;
  planName: 'trial' | 'starter' | 'business' | 'pro' | null;
  subscriptionEnd: Date | null;
  subscription: any | null;
}

const DEFAULT_STATUS: SubscriptionStatus = {
  isActive: false,
  isTrial: false,
  isExpired: false,
  trialDaysLeft: 0,
  planName: null,
  subscriptionEnd: null,
  subscription: null,
};

const TRIAL_DAYS = 30;

// Date de réinitialisation globale du trial (anciens ET nouveaux users).
// Toute l'ancienne base démarre un nouvel essai à partir de cette date,
// les nouveaux comptes démarrent à leur date de création de profil.
const TRIAL_RESET_DATE = new Date('2026-04-21T00:00:00Z');

export function useSubscription() {
  const { user, isEmployee } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user || isEmployee) {
      // Les employés héritent de l'accès du propriétaire.
      setStatus({ ...DEFAULT_STATUS, isActive: true, planName: 'pro' });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Anchor: max(profile.created_at, TRIAL_RESET_DATE)
      // → anciens users : essai redémarre depuis TRIAL_RESET_DATE
      // → nouveaux users : essai démarre à leur création
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileCreated = new Date(profile?.created_at ?? user.created_at ?? Date.now());
      const anchor = profileCreated.getTime() > TRIAL_RESET_DATE.getTime()
        ? profileCreated
        : TRIAL_RESET_DATE;

      const trialEnd = new Date(anchor.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      // 1) Abonnement payant actif uniquement s'il a été créé APRÈS l'anchor.
      //    (les vieux subs legacy ne bloquent pas le reset du trial).
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('created_at', anchor.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        const end = sub.expires_at ? new Date(sub.expires_at) : null;
        const isExpired = end ? end.getTime() < Date.now() : false;
        setStatus({
          isActive: !isExpired,
          isTrial: false,
          isExpired,
          trialDaysLeft: 0,
          planName: sub.plan as any,
          subscriptionEnd: end,
          subscription: sub,
        });
        return;
      }

      // 2) Essai gratuit 30 jours pour tout le monde.
      const msLeft = trialEnd.getTime() - Date.now();
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      const trialActive = msLeft > 0;

      setStatus({
        isActive: trialActive,
        isTrial: trialActive,
        isExpired: !trialActive,
        trialDaysLeft: daysLeft,
        planName: trialActive ? 'trial' : null,
        subscriptionEnd: trialEnd,
        subscription: null,
      });
    } catch (e) {
      console.error('useSubscription error:', e);
      setStatus(DEFAULT_STATUS);
    } finally {
      setIsLoading(false);
    }
  }, [user, isEmployee]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, isLoading, refetch: fetchStatus };
}
