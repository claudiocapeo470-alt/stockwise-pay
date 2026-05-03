ALTER TABLE public.store_products
ADD COLUMN IF NOT EXISTS out_of_stock_threshold integer NOT NULL DEFAULT 0;

UPDATE public.store_products
SET out_of_stock_threshold = 0
WHERE out_of_stock_threshold IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_products_stock_threshold
ON public.store_products(store_id, product_id, out_of_stock_threshold);