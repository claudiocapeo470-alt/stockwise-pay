CREATE OR REPLACE FUNCTION public.submit_store_review(
  _store_id uuid,
  _product_id uuid,
  _customer_name text,
  _rating integer,
  _comment text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name text;
  _text text;
  _new_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.online_store s WHERE s.id = _store_id AND s.is_published = true) THEN
    RAISE EXCEPTION 'Boutique introuvable ou non publiée';
  END IF;

  IF _product_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.store_products sp
      WHERE sp.store_id = _store_id AND sp.product_id = _product_id
    ) THEN
      RAISE EXCEPTION 'Produit introuvable dans cette boutique';
    END IF;
  END IF;

  IF _rating IS NULL OR _rating < 1 OR _rating > 5 THEN
    RAISE EXCEPTION 'Note invalide';
  END IF;

  _name := btrim(coalesce(_customer_name, ''));
  IF _name = '' THEN
    RAISE EXCEPTION 'Nom requis';
  END IF;
  _name := left(_name, 60);

  _text := nullif(btrim(coalesce(_comment, '')), '');
  IF _text IS NOT NULL THEN
    _text := left(_text, 1000);
  END IF;

  INSERT INTO public.store_reviews (store_id, product_id, customer_name, rating, comment, is_approved)
  VALUES (_store_id, _product_id, _name, _rating, _text, false)
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_store_review(uuid, uuid, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_store_review(uuid, uuid, text, integer, text) TO anon, authenticated;