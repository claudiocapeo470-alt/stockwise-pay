
-- 1. Add created_by_member_id to sales table
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS created_by_member_id UUID REFERENCES public.company_members(id) ON DELETE SET NULL;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_notifications" ON public.notifications
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = notifications.company_id AND companies.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = notifications.company_id AND companies.owner_id = auth.uid()));

-- 3. Add referral columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- 4. Create function to generate referral code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := UPPER(SUBSTR(MD5(gen_random_uuid()::text), 1, 8));
      SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();
