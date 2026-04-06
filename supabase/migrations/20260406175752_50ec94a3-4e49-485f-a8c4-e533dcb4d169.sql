DROP POLICY IF EXISTS "Users can manage their own store" ON public.online_store;
CREATE POLICY "Users can manage their own store"
ON public.online_store
FOR ALL TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.company_members cm
    JOIN public.companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
      AND cm.is_active = true
      AND c.owner_id = online_store.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.company_members cm
    JOIN public.companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
      AND cm.is_active = true
      AND c.owner_id = online_store.user_id
  )
);

DROP POLICY IF EXISTS "Users can manage their store products" ON public.store_products;
CREATE POLICY "Users can manage their store products"
ON public.store_products
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_products.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_products.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
);

DROP POLICY IF EXISTS "Store owners can manage orders" ON public.store_orders;
CREATE POLICY "Store owners can manage orders"
ON public.store_orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_orders.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_orders.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
);

DROP POLICY IF EXISTS "Store owners can manage reviews" ON public.store_reviews;
CREATE POLICY "Store owners can manage reviews"
ON public.store_reviews
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_reviews.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.online_store os
    WHERE os.id = store_reviews.store_id
      AND (
        os.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          JOIN public.companies c ON c.id = cm.company_id
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND c.owner_id = os.user_id
        )
      )
  )
);

DROP POLICY IF EXISTS "owners_manage_deliveries" ON public.deliveries;
CREATE POLICY "owners_manage_deliveries"
ON public.deliveries
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = deliveries.company_id
      AND (
        c.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND cm.company_id = c.id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = deliveries.company_id
      AND (
        c.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.company_members cm
          WHERE cm.auth_user_id = auth.uid()
            AND cm.is_active = true
            AND cm.company_id = c.id
        )
      )
  )
);

DROP POLICY IF EXISTS "drivers_view_deliveries" ON public.deliveries;
CREATE POLICY "drivers_view_deliveries"
ON public.deliveries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.id = deliveries.driver_member_id
      AND cm.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "drivers_update_deliveries" ON public.deliveries;
CREATE POLICY "drivers_update_deliveries"
ON public.deliveries
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.id = deliveries.driver_member_id
      AND cm.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.id = deliveries.driver_member_id
      AND cm.auth_user_id = auth.uid()
  )
);