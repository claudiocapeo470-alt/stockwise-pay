import { useState } from 'react';

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
  // Payment system disabled — always return active/free status
  const [status] = useState<SubscriptionStatus>({
    isActive: true,
    isTrial: false,
    isExpired: false,
    trialDaysLeft: 0,
    planName: 'pro',
    subscriptionEnd: null,
    subscription: null,
  });

  return { status, isLoading: false, refetch: async () => {} };
}
