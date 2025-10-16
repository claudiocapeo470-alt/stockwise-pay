-- Ajouter les colonnes pour stocker les informations de l'entreprise dans chaque facture/devis
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_postal_code TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS company_tva TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

COMMENT ON COLUMN public.invoices.company_name IS 'Nom de l''entreprise au moment de la création du document';
COMMENT ON COLUMN public.invoices.company_logo_url IS 'URL du logo de l''entreprise au moment de la création du document';