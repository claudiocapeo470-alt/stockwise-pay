
-- Table for storing multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- RLS policy: users manage their own product images
CREATE POLICY "Users can manage their own product images"
  ON public.product_images
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view product images via store
CREATE POLICY "Public can view product images via store"
  ON public.product_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM store_products sp
      JOIN online_store os ON os.id = sp.store_id
      WHERE sp.product_id = product_images.product_id
      AND os.is_published = true
    )
  );

-- Index for fast lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
