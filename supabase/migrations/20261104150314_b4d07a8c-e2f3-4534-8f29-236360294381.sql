CREATE OR REPLACE FUNCTION public.notify_new_store_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _owner_id uuid; _company_id uuid; _items int;
BEGIN
  SELECT os.user_id INTO _owner_id FROM public.online_store os WHERE os.id = NEW.store_id;
  IF _owner_id IS NULL THEN RETURN NEW; END IF;
  SELECT c.id INTO _company_id FROM public.companies c WHERE c.owner_id = _owner_id LIMIT 1;
  _items := COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(NEW.items::jsonb)='array' THEN NEW.items::jsonb ELSE '[]'::jsonb END), 0);
  PERFORM net.http_post(
    url := 'https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object('Content-Type','application/json','x-push-trigger-secret','2ca7f59be616e95ec11230b6802d2f10ce9c478be2f08a53'),
    body := jsonb_build_object(
      'user_id', _owner_id, 'company_id', _company_id, 'type', 'success',
      'title', 'Nouvelle commande ' || COALESCE(NEW.order_number, ''),
      'body', COALESCE(NULLIF(btrim(NEW.customer_name), ''), 'Un client') || ' a commandé ' || _items || CASE WHEN _items > 1 THEN ' articles' ELSE ' article' END
              || ' pour ' || replace(to_char(COALESCE(NEW.total, 0), 'FM999,999,999'), ',', ' ') || ' FCFA',
      'url', '/app/boutique/commandes', 'tag', 'order-' || NEW.id::text));
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _company_id uuid;
BEGIN
  IF NEW.min_quantity > 0 AND NEW.quantity <= NEW.min_quantity
     AND (OLD.quantity > OLD.min_quantity OR (NEW.quantity = 0 AND OLD.quantity > 0)) THEN
    SELECT c.id INTO _company_id FROM public.companies c WHERE c.owner_id = NEW.user_id LIMIT 1;
    PERFORM net.http_post(
      url := 'https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object('Content-Type','application/json','x-push-trigger-secret','2ca7f59be616e95ec11230b6802d2f10ce9c478be2f08a53'),
      body := jsonb_build_object(
        'user_id', NEW.user_id, 'company_id', _company_id,
        'type', CASE WHEN NEW.quantity = 0 THEN 'error' ELSE 'warning' END,
        'title', CASE WHEN NEW.quantity = 0 THEN 'Rupture de stock' ELSE 'Stock bas' END,
        'body', CASE WHEN NEW.quantity = 0 THEN NEW.name || ' est en rupture de stock'
                ELSE NEW.name || ' : plus que ' || NEW.quantity || CASE WHEN NEW.quantity > 1 THEN ' unités' ELSE ' unité' END || ' en stock' END,
        'url', '/app/stocks', 'tag', 'stock-' || NEW.id::text,
        'requireInteraction', NEW.quantity = 0));
  END IF;
  RETURN NEW;
END; $$;