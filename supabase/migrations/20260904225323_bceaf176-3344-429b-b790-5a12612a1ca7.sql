-- Helper: does the current auth user act as an active member of the company owned by _owner_id, with a given permission?
CREATE OR REPLACE FUNCTION public.member_has_permission(_owner_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    JOIN public.companies c ON c.id = cm.company_id
    LEFT JOIN public.company_roles r ON r.id = cm.role_id
    WHERE cm.auth_user_id = auth.uid()
      AND cm.is_active = true
      AND c.owner_id = _owner_id
      AND (
        COALESCE((r.permissions ->> 'all')::boolean, false) = true
        OR COALESCE((r.permissions ->> _permission)::boolean, false) = true
        OR (jsonb_typeof(r.permissions -> _permission) = 'array'
            AND jsonb_array_length(r.permissions -> _permission) > 0)
      )
  )
$$;

REVOKE ALL ON FUNCTION public.member_has_permission(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.member_has_permission(uuid, text) TO authenticated, service_role;

-- INVOICES (factures + devis)
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
CREATE POLICY "Owners and sales members manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'sales')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'sales')
);

-- INVOICE ITEMS
DROP POLICY IF EXISTS "Users can manage their own invoice items" ON public.invoice_items;
CREATE POLICY "Owners and sales members manage invoice items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (i.user_id = auth.uid() OR public.member_has_permission(i.user_id, 'sales'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (i.user_id = auth.uid() OR public.member_has_permission(i.user_id, 'sales'))
  )
);

-- PAYMENTS
DROP POLICY IF EXISTS "Users can manage their own payments" ON public.payments;
CREATE POLICY "Owners and sales members manage payments"
ON public.payments
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'sales')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.member_has_permission(user_id, 'sales')
);
