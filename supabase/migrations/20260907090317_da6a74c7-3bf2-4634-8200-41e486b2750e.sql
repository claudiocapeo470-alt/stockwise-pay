CREATE OR REPLACE FUNCTION public.validate_store_order_pricing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store        RECORD;
  v_item         jsonb;
  v_items_out    jsonb := '[]'::jsonb;
  v_subtotal     numeric := 0;
  v_delivery     numeric := 0;
  v_product_id   uuid;
  v_qty          integer;
  v_price        numeric;
  v_prod         RECORD;
BEGIN
  SELECT os.id, os.user_id, os.is_published, os.allow_orders,
         COALESCE(os.delivery_fee, 0) AS delivery_fee,
         COALESCE(os.free_delivery_minimum, 0) AS free_delivery_minimum
    INTO v_store
    FROM public.online_store os
   WHERE os.id = NEW.store_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Boutique introuvable';
  END IF;

  -- Le propriétaire de la boutique garde la main sur les commandes manuelles
  IF auth.uid() IS NOT NULL AND auth.uid() = v_store.user_id THEN
    RETURN NEW;
  END IF;

  IF v_store.is_published IS NOT TRUE OR v_store.allow_orders IS NOT TRUE THEN
    RAISE EXCEPTION 'Cette boutique n''accepte pas de commandes actuellement';
  END IF;

  IF NEW.items IS NULL OR jsonb_typeof(NEW.items) <> 'array' OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Commande vide';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    BEGIN
      v_product_id := (v_item->>'id')::uuid;
    EXCEPTION WHEN others THEN
      v_product_id := NULL;
    END;

    v_qty := GREATEST(COALESCE((v_item->>'quantity')::int, 0), 0);
    IF v_qty = 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour un article de la commande';
    END IF;

    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Article invalide dans la commande (produit non identifié)';
    END IF;

    SELECT p.id, p.name, p.quantity, p.price, p.icon_emoji,
           sp.online_price, sp.is_active, sp.force_out_of_stock, sp.out_of_stock_threshold
      INTO v_prod
      FROM public.store_products sp
      JOIN public.products p ON p.id = sp.product_id
     WHERE sp.store_id = v_store.id
       AND sp.product_id = v_product_id
       AND p.user_id = v_store.user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Un produit de votre commande n''est plus disponible';
    END IF;

    IF v_prod.is_active IS FALSE OR v_prod.force_out_of_stock IS TRUE THEN
      RAISE EXCEPTION 'Le produit "%" n''est plus disponible', v_prod.name;
    END IF;

    IF COALESCE(v_prod.quantity, 0) < v_qty THEN
      RAISE EXCEPTION 'Stock insuffisant pour le produit "%"', v_prod.name;
    END IF;

    v_price := COALESCE(v_prod.online_price, v_prod.price, 0);
    v_subtotal := v_subtotal + (v_price * v_qty);

    v_items_out := v_items_out || jsonb_build_object(
      'id', v_prod.id,
      'name', v_prod.name,
      'icon', COALESCE(v_item->>'icon', v_prod.icon_emoji),
      'price', v_price,
      'quantity', v_qty
    );
  END LOOP;

  IF v_store.free_delivery_minimum > 0 AND v_subtotal >= v_store.free_delivery_minimum THEN
    v_delivery := 0;
  ELSE
    v_delivery := v_store.delivery_fee;
  END IF;

  NEW.items := v_items_out;
  NEW.subtotal := v_subtotal;
  NEW.delivery_fee := v_delivery;
  NEW.total := v_subtotal + v_delivery;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_store_order_pricing() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validate_store_order_pricing ON public.store_orders;
CREATE TRIGGER trg_validate_store_order_pricing
BEFORE INSERT ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.validate_store_order_pricing();