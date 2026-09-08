CREATE OR REPLACE FUNCTION public.sync_order_status_from_delivery()
RETURNS TRIGGER
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
  ELSIF NEW.status = 'in_progress' THEN
    UPDATE public.store_orders
      SET status = 'shipped', updated_at = now()
      WHERE id = NEW.store_order_id AND status NOT IN ('delivered', 'cancelled', 'shipped');
  ELSIF NEW.status = 'problem' THEN
    UPDATE public.store_orders
      SET status = 'problem', updated_at = now()
      WHERE id = NEW.store_order_id AND status NOT IN ('delivered', 'cancelled');
  END IF;

  RETURN NEW;
END;
$$;

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
    ),
    'delivery_problem_reason', d.problem_reason
  )
  FROM public.store_orders o
  JOIN public.online_store s ON s.id = o.store_id
  LEFT JOIN public.deliveries d ON d.store_order_id = o.id
  WHERE o.id = _order_id;
$$;