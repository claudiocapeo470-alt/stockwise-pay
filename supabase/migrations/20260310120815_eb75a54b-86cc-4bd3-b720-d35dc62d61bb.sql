ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS plan_price INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS moneroo_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moneroo_payment_id TEXT,
  plan_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'XOF',
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT NOT NULL,
  payment_method TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_payment_history" ON public.payment_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "service_role_manage_payment_history" ON public.payment_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);