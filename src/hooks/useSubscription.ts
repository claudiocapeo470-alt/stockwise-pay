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
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('useSubscription error:', error);
        setStatus(DEFAULT_STATUS);
      } else if (data) {
        const end = data.expires_at ? new Date(data.expires_at) : null;
        const isExpired = end ? end.getTime() < Date.now() : false;
        setStatus({
          isActive: !isExpired,
          isTrial: false,
          isExpired,
          trialDaysLeft: 0,
          planName: data.plan as any,
          subscriptionEnd: end,
          subscription: data,
        });
      } else {
        setStatus(DEFAULT_STATUS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isEmployee]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, isLoading, refetch: fetchStatus };
}
