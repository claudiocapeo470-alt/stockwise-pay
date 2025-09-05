-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  paystack_customer_code TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_code TEXT,
  subscription_end TIMESTAMPTZ,
  amount INTEGER NOT NULL DEFAULT 9999, -- Amount in FCFA
  currency TEXT NOT NULL DEFAULT 'XOF', -- FCFA currency code
  is_legacy_user BOOLEAN NOT NULL DEFAULT false, -- For existing users
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Mark existing users as legacy (they start paying next month)
INSERT INTO public.subscribers (user_id, email, subscribed, is_legacy_user, subscription_end)
SELECT 
  id, 
  email, 
  true, 
  true,
  now() + interval '1 month'
FROM auth.users;