-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('facture', 'devis');

-- Create enum for document status
CREATE TYPE public.document_status AS ENUM ('brouillon', 'envoye', 'paye', 'annule', 'accepte', 'refuse');

-- Create company_settings table for storing user's company info
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT,
  company_city TEXT,
  company_postal_code TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_siret TEXT,
  company_tva TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create invoices table (factures et devis)
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type public.document_type NOT NULL DEFAULT 'facture',
  document_number TEXT NOT NULL,
  status public.document_status NOT NULL DEFAULT 'brouillon',
  
  -- Client info
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_city TEXT,
  client_postal_code TEXT,
  client_email TEXT,
  client_phone TEXT,
  
  -- Financial info
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- Dates
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Additional info
  notes TEXT,
  terms TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table (lignes d'articles)
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 20, -- TVA en %
  discount_rate NUMERIC NOT NULL DEFAULT 0, -- Remise en %
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_settings
CREATE POLICY "Users can manage their own company settings"
  ON public.company_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can manage their own invoices"
  ON public.invoices
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for invoice_items
CREATE POLICY "Users can manage their own invoice items"
  ON public.invoice_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate document number
CREATE OR REPLACE FUNCTION public.generate_document_number(
  _user_id UUID,
  _document_type public.document_type,
  _year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prefix TEXT;
  _count INTEGER;
  _number TEXT;
BEGIN
  -- Determine prefix based on document type
  _prefix := CASE 
    WHEN _document_type = 'facture' THEN 'FAC'
    WHEN _document_type = 'devis' THEN 'DEV'
    ELSE 'DOC'
  END;
  
  -- Count existing documents of this type for this year
  SELECT COUNT(*) + 1 INTO _count
  FROM public.invoices
  WHERE user_id = _user_id
    AND document_type = _document_type
    AND EXTRACT(YEAR FROM issue_date) = _year;
  
  -- Format: FAC-2025-001
  _number := _prefix || '-' || _year || '-' || LPAD(_count::TEXT, 3, '0');
  
  RETURN _number;
END;
$$;