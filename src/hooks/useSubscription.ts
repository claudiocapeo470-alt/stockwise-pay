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

export function useSubscription() {
  const { user, isEmployee } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user || isEmployee) {
      // Employees inherit owner access; we don't gate them here.
      setStatus({ ...DEFAULT_STATUS, isActive: true, planName: 'pro' });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Anchor: profile creation date (fallback to user.created_at)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const anchor = new Date(profile?.created_at ?? user.created_at ?? Date.now());
      const trialEnd = new Date(anchor.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      // 1) Active paid subscription wins ONLY if it was created AFTER the trial would have started
      //    (so legacy/old subscriptions don't block the new 30-day trial reset).
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

      // 2) Free 30-day trial for everyone — anchored on profile creation date.
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
