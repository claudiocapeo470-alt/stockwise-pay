DROP POLICY IF EXISTS "Users can manage their own invoice items" ON public.invoice_items;

CREATE POLICY "Users can manage their own invoice items"
ON public.invoice_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (
        i.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = i.user_id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (
        i.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = i.user_id
        )
      )
  )
);