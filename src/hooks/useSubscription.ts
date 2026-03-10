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

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: true,
    isTrial: false,
    isExpired: false,
    trialDaysLeft: 0,
    planName: null,
    subscriptionEnd: null,
    subscription: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        setStatus({
          isActive: false,
          isTrial: false,
          isExpired: true,
          trialDaysLeft: 0,
          planName: null,
          subscriptionEnd: null,
          subscription: null,
        });
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const subEnd = data.subscription_end ? new Date(data.subscription_end) : null;
      const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
      const isTrial = data.is_trial === true;
      const isSubscribed = data.subscribed === true;
      const isActive = isSubscribed && subEnd ? subEnd > now : false;
      const isExpired = !isActive;

      let trialDaysLeft = 0;
      if (isTrial && trialEnd) {
        trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      setStatus({
        isActive,
        isTrial,
        isExpired,
        trialDaysLeft,
        planName: (data.plan_name as any) || null,
        subscriptionEnd: subEnd,
        subscription: data,
      });
    } catch (err) {
      console.error('useSubscription error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { status, isLoading, refetch: fetchSubscription };
}
