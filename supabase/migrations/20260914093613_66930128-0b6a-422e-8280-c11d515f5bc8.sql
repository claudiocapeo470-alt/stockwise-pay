CREATE TABLE public.telegram_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  telegram_chat_id text,
  telegram_username text,
  linked_at timestamp with time zone,
  link_token text UNIQUE,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their company telegram link"
ON public.telegram_links FOR ALL TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

CREATE INDEX idx_telegram_links_token ON public.telegram_links (link_token);
CREATE INDEX idx_telegram_links_chat ON public.telegram_links (telegram_chat_id);

CREATE TRIGGER update_telegram_links_updated_at
BEFORE UPDATE ON public.telegram_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_links;