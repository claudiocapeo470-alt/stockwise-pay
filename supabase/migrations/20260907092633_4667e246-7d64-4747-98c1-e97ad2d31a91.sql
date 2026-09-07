
-- 1) Génération serveur du numéro de commande
CREATE OR REPLACE FUNCTION public.generate_order_number(_store_id uuid, _year integer DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year integer := COALESCE(_year, EXTRACT(YEAR FROM now())::integer);
  v_next integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('store_order_number:' || _store_id::text || ':' || v_year::text));

  SELECT COALESCE(MAX((regexp_replace(order_number, '^CMD-\d{4}-', ''))::integer), 0) + 1
  INTO v_next
  FROM public.store_orders
  WHERE store_id = _store_id
    AND order_number ~ ('^CMD-' || v_year::text || '-\d+$');

  RETURN 'CMD-' || v_year::text || '-' || LPAD(v_next::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.generate_order_number(uuid, integer) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_store_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR btrim(NEW.order_number) = '' THEN
    NEW.order_number := public.generate_order_number(NEW.store_id);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_store_order_number() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_set_store_order_number ON public.store_orders;
CREATE TRIGGER trg_set_store_order_number
BEFORE INSERT ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.set_store_order_number();

ALTER TABLE public.store_orders ALTER COLUMN order_number DROP NOT NULL;

-- 2) Lecture sécurisée du suivi de commande (par identifiant de commande uniquement)
CREATE OR REPLACE FUNCTION public.get_order_tracking(_order_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'created_at', o.created_at,
    'items', o.items,
    'subtotal', o.subtotal,
    'delivery_fee', o.delivery_fee,
    'total', o.total,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'customer_address', o.customer_address,
    'store', jsonb_build_object(
      'name', s.name,
      'slug', s.slug,
      'logo_url', s.logo_url,
      'primary_color', s.primary_color,
      'whatsapp', s.whatsapp
    )
  )
  FROM public.store_orders o
  JOIN public.online_store s ON s.id = o.store_id
  WHERE o.id = _order_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_tracking(uuid) TO anon, authenticated;

-- 3) Synchronisation du statut commande depuis la livraison
CREATE OR REPLACE FUNCTION public.sync_order_status_from_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.store_order_id IS NULL OR NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'delivered' THEN
    UPDATE public.store_orders
      SET status = 'delivered', updated_at = now()
      WHERE id = NEW.store_order_id AND status <> 'delivered';
  ELSIF NEW.status IN ('in_progress', 'problem') THEN
    UPDATE public.store_orders
      SET status = 'shipped', updated_at = now()
      WHERE id = NEW.store_order_id AND status NOT IN ('delivered', 'cancelled', 'shipped');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_order_status_from_delivery() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_order_status_from_delivery ON public.deliveries;
CREATE TRIGGER trg_sync_order_status_from_delivery
AFTER UPDATE ON public.deliveries
FOR EACH ROW EXECUTE FUNCTION public.sync_order_status_from_delivery();
