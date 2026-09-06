DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
CREATE POLICY "Owners and authorized members manage customers"
ON public.customers FOR ALL TO authenticated
USING (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'pos')
  OR public.member_has_permission(user_id, 'sales')
  OR public.member_has_permission(user_id, 'customers')
  OR public.member_has_permission(user_id, 'customers_read')
  OR public.member_has_permission(user_id, 'customers_minimal')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'pos')
  OR public.member_has_permission(user_id, 'sales')
  OR public.member_has_permission(user_id, 'customers')
);

DROP POLICY IF EXISTS "Users can manage their own cash sessions" ON public.cash_sessions;
CREATE POLICY "Owners and pos members manage cash sessions"
ON public.cash_sessions FOR ALL TO authenticated
USING (auth.uid() = user_id OR public.member_has_permission(user_id, 'pos'))
WITH CHECK (auth.uid() = user_id OR public.member_has_permission(user_id, 'pos'));

DROP POLICY IF EXISTS "Users can manage their own cash movements" ON public.cash_movements;
CREATE POLICY "Owners and pos members manage cash movements"
ON public.cash_movements FOR ALL TO authenticated
USING (auth.uid() = user_id OR public.member_has_permission(user_id, 'pos'))
WITH CHECK (auth.uid() = user_id OR public.member_has_permission(user_id, 'pos'));