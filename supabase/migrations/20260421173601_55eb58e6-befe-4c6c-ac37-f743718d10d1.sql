-- Table subscriptions pour tracker les transactions Paiement Pro
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference text NOT NULL UNIQUE,
  amount integer NOT NULL,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  billing_cycle text DEFAULT 'monthly',
  payment_method text,
  session_id text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'failed', 'cancelled', 'expired'))
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_reference ON public.subscriptions(reference);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "users_view_own_subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Service role manages all (for edge functions)
CREATE POLICY "service_role_manage_subscriptions"
ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "admins_view_all_subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));