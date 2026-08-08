GRANT INSERT ON public.store_reviews TO anon, authenticated;

CREATE POLICY "Visitors can submit pending reviews"
ON public.store_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  is_approved IS NOT TRUE
  AND rating BETWEEN 1 AND 5
  AND char_length(customer_name) BETWEEN 2 AND 60
  AND char_length(COALESCE(comment, '')) <= 1000
  AND EXISTS (
    SELECT 1 FROM public.online_store os
    WHERE os.id = store_id
      AND os.is_published = true
      AND os.enable_reviews = true
  )
);