
-- BUG #5: Fix RLS for stock_movements (INSERT/UPDATE for employees)
DROP POLICY IF EXISTS "Employees can insert stock movements" ON public.stock_movements;
CREATE POLICY "Employees can insert stock movements"
ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = stock_movements.user_id
  )
);

DROP POLICY IF EXISTS "Employees can update stock movements" ON public.stock_movements;
CREATE POLICY "Employees can update stock movements"
ON public.stock_movements FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = stock_movements.user_id
  )
);
