-- Add client_logo_url column to invoices table
ALTER TABLE public.invoices
ADD COLUMN client_logo_url text;

-- Create storage bucket for client logos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for client logos
CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view client logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-logos');

CREATE POLICY "Users can update their own client logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own client logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos' AND auth.uid()::text = (storage.foldername(name))[1]);