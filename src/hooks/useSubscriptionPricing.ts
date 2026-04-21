import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_PRICES = {
  starter: 9900,
  business: 24900,
  pro: 49900,
} as const;

export type SubscriptionPrices = {
  starter: number;
  business: number;
  pro: number;
};

export function useSubscriptionPricing() {
  const [prices, setPrices] = useState<SubscriptionPrices>({ ...DEFAULT_PRICES });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_subscription_pricing' as any);
      if (!error && data && typeof data === 'object') {
        const d = data as any;
        setPrices({
          starter: Number(d.starter) || DEFAULT_PRICES.starter,
          business: Number(d.business) || DEFAULT_PRICES.business,
          pro: Number(d.pro) || DEFAULT_PRICES.pro,
        });
      }
    } catch {
      setPrices({ ...DEFAULT_PRICES });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, isLoading, refetch: fetchPrices };
}
