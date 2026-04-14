import { ReactNode } from 'react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * SubscriptionGuard — intentionally passes through all children.
 * 
 * The payment/subscription system is currently DISABLED (useSubscription always returns isActive: true).
 * When the payment system is re-enabled in production, this guard must be updated to:
 * 1. Check useSubscription().status.isActive
 * 2. Redirect expired users to /app/subscription
 * 3. Show a trial expiring banner via TrialBanner component
 * 
 * DO NOT remove this component — it serves as the enforcement point for future subscription gating.
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  // TODO: Uncomment when payment system is enabled
  // const { status, isLoading } = useSubscription();
  // if (isLoading) return <LoadingSpinner />;
  // if (!status.isActive) return <Navigate to="/app/subscription" replace />;
  return <>{children}</>;
}
