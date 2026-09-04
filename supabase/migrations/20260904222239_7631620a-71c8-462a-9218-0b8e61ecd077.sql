CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_new_store_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_id uuid;
  _company_id uuid;
BEGIN
  SELECT os.user_id INTO _owner_id
  FROM public.online_store os
  WHERE os.id = NEW.store_id;

  IF _owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.id INTO _company_id
  FROM public.companies c
  WHERE c.owner_id = _owner_id
  LIMIT 1;

  PERFORM net.http_post(
    url := 'https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-trigger-secret', '2ca7f59be616e95ec11230b6802d2f10ce9c478be2f08a53'
    ),
    body := jsonb_build_object(
      'user_id', _owner_id,
      'company_id', _company_id,
      'type', 'success',
      'title', 'Nouvelle commande',
      'body', COALESCE(NEW.customer_name, 'Client') || ' — ' || to_char(COALESCE(NEW.total, 0), 'FM999G999G999') || ' FCFA',
      'url', '/app/boutique/commandes',
      'tag', 'order-' || NEW.id::text
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_store_order ON public.store_orders;
CREATE TRIGGER trg_notify_new_store_order
AFTER INSERT ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_new_store_order();

CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _company_id uuid;
BEGIN
  IF NEW.min_quantity > 0
     AND NEW.quantity <= NEW.min_quantity
     AND (OLD.quantity > OLD.min_quantity OR OLD.quantity IS DISTINCT FROM NEW.quantity)
  THEN
    SELECT c.id INTO _company_id
    FROM public.companies c
    WHERE c.owner_id = NEW.user_id
    LIMIT 1;

    PERFORM net.http_post(
      url := 'https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-trigger-secret', '2ca7f59be616e95ec11230b6802d2f10ce9c478be2f08a53'
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'company_id', _company_id,
        'type', CASE WHEN NEW.quantity = 0 THEN 'error' ELSE 'warning' END,
        'title', CASE WHEN NEW.quantity = 0 THEN 'Rupture de stock' ELSE 'Stock bas' END,
        'body', NEW.name || ' — il reste ' || NEW.quantity::text || ' unité(s)',
        'url', '/app/stocks',
        'tag', 'stock-' || NEW.id::text,
        'requireInteraction', NEW.quantity = 0
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.products;
CREATE TRIGGER trg_notify_low_stock
AFTER UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_low_stock();