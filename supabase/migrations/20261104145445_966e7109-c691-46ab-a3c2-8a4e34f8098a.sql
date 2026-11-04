CREATE OR REPLACE FUNCTION public.generate_order_number(_store_id uuid, _year integer DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year integer := COALESCE(_year, EXTRACT(YEAR FROM now())::integer);
  v_next integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('store_order_number:' || v_year::text));
  SELECT COALESCE(MAX((regexp_replace(order_number, '^CMD-\d{4}-', ''))::integer), 0) + 1
  INTO v_next FROM public.store_orders
  WHERE order_number ~ ('^CMD-' || v_year::text || '-\d+$');
  RETURN 'CMD-' || v_year::text || '-' || LPAD(v_next::text, 4, '0');
END; $$;
REVOKE ALL ON FUNCTION public.generate_order_number(uuid, integer) FROM public, anon, authenticated;