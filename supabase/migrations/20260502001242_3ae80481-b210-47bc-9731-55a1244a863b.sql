ALTER TABLE public.store_products
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS force_out_of_stock boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_store_products_active_stock
ON public.store_products(store_id, is_active, force_out_of_stock);