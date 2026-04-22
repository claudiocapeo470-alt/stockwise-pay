
-- Création du bucket pour les bannières de boutique
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-banners', 'store-banners', true, 3145728, ARRAY['image/jpeg','image/png','image/webp','image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/jpg'];

-- Policies: lecture publique
DROP POLICY IF EXISTS "Public read store banners" ON storage.objects;
CREATE POLICY "Public read store banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-banners');

-- Upload : utilisateur authentifié dans son propre dossier (premier segment = auth.uid())
DROP POLICY IF EXISTS "Users upload own store banners" ON storage.objects;
CREATE POLICY "Users upload own store banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-banners'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update propre dossier
DROP POLICY IF EXISTS "Users update own store banners" ON storage.objects;
CREATE POLICY "Users update own store banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-banners'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression propre dossier
DROP POLICY IF EXISTS "Users delete own store banners" ON storage.objects;
CREATE POLICY "Users delete own store banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-banners'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
