
CREATE TABLE IF NOT EXISTS public.ceo_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_ceo_only" ON public.ceo_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
