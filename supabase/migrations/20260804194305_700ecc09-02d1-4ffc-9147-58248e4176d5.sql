-- 1. store_order_items: remove open insert policies
DROP POLICY IF EXISTS "Public can insert order items" ON public.store_order_items;
DROP POLICY IF EXISTS "Authenticated can insert order items" ON public.store_order_items;

CREATE POLICY "Store owners can insert order items"
ON public.store_order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.store_orders so
    JOIN public.online_store os ON os.id = so.store_id
    WHERE so.id = store_order_items.order_id
      AND os.user_id = auth.uid()
  )
);

REVOKE INSERT ON public.store_order_items FROM anon;

-- 2. store_reviews: remove open insert policies (owners keep the ALL policy)
DROP POLICY IF EXISTS "Public can create reviews" ON public.store_reviews;
DROP POLICY IF EXISTS "Authenticated can create reviews" ON public.store_reviews;

REVOKE INSERT, UPDATE, DELETE ON public.store_reviews FROM anon;

-- 3. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.assign_admin_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_reset_codes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_default_company_data() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_payment_from_sale() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_sale_stock_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_stock_movement_on_sale() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_company_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_pin_login(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_reset_code(text, text) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_company_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_document_number(uuid, public.document_type, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_member_pin(uuid, text) FROM PUBLIC, anon;

-- Functions still required by the app / RLS policies
GRANT EXECUTE ON FUNCTION public.generate_company_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number(uuid, public.document_type, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_member_pin(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_pricing() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_company_member(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_owner(uuid, uuid) TO anon, authenticated;

-- Edge functions use the service role
GRANT EXECUTE ON FUNCTION public.validate_pin_login(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_reset_code(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_reset_codes() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts() TO service_role;