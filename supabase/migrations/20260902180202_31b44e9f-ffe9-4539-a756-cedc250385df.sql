CREATE TABLE public.shop_pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL UNIQUE REFERENCES public.online_store(id) ON DELETE CASCADE,
  meta_pixel_id text,
  google_ads_conversion_id text,
  ga4_measurement_id text,
  tiktok_pixel_id text,
  snapchat_pixel_id text,
  linkedin_partner_id text,
  x_pixel_id text,
  enabled_platforms jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shop_pixels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_pixels TO authenticated;
GRANT ALL ON public.shop_pixels TO service_role;

ALTER TABLE public.shop_pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pixels of published stores"
ON public.shop_pixels FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.online_store s WHERE s.id = shop_pixels.shop_id AND s.is_published = true));

CREATE POLICY "Store owners manage their pixels"
ON public.shop_pixels FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.online_store s WHERE s.id = shop_pixels.shop_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.online_store s WHERE s.id = shop_pixels.shop_id AND s.user_id = auth.uid()));

CREATE TRIGGER update_shop_pixels_updated_at
BEFORE UPDATE ON public.shop_pixels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();