ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS selected_modules TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS company_name_set BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);