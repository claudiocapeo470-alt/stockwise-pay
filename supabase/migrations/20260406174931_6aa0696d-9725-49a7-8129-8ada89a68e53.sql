
-- Drop existing restrictive policies and replace with employee-aware ones

-- ===== PRODUCTS =====
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
CREATE POLICY "Users can manage their own products" ON public.products
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = products.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = products.user_id
  )
);

-- ===== SALES =====
DROP POLICY IF EXISTS "Users can manage their own sales" ON public.sales;
CREATE POLICY "Users can manage their own sales" ON public.sales
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = sales.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = sales.user_id
  )
);

-- ===== CASH_SESSIONS =====
DROP POLICY IF EXISTS "Users can manage their own cash sessions" ON public.cash_sessions;
CREATE POLICY "Users can manage their own cash sessions" ON public.cash_sessions
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = cash_sessions.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = cash_sessions.user_id
  )
);

-- ===== CASH_MOVEMENTS =====
DROP POLICY IF EXISTS "Users can manage their own cash movements" ON public.cash_movements;
CREATE POLICY "Users can manage their own cash movements" ON public.cash_movements
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = cash_movements.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = cash_movements.user_id
  )
);

-- ===== PRODUCT_CATEGORIES =====
DROP POLICY IF EXISTS "Users can manage their own categories" ON public.product_categories;
CREATE POLICY "Users can manage their own categories" ON public.product_categories
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = product_categories.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = product_categories.user_id
  )
);

-- ===== PAYMENTS =====
DROP POLICY IF EXISTS "Users can manage their own payments" ON public.payments;
CREATE POLICY "Users can manage their own payments" ON public.payments
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = payments.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = payments.user_id
  )
);

-- ===== CUSTOMERS =====
DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
CREATE POLICY "Users can manage their own customers" ON public.customers
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = customers.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = customers.user_id
  )
);

-- ===== PRODUCT_IMAGES =====
DROP POLICY IF EXISTS "Users can manage their own product images" ON public.product_images;
CREATE POLICY "Users can manage their own product images" ON public.product_images
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = product_images.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = product_images.user_id
  )
);

-- ===== STOCK_MOVEMENTS (SELECT only - already restricted) =====
DROP POLICY IF EXISTS "Users can view their own stock movements" ON public.stock_movements;
CREATE POLICY "Users can view their own stock movements" ON public.stock_movements
FOR SELECT TO authenticated
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

-- ===== INVOICES =====
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
CREATE POLICY "Users can manage their own invoices" ON public.invoices
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = invoices.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = invoices.user_id
  )
);

-- ===== COMPANY_SETTINGS =====
DROP POLICY IF EXISTS "Users can manage their own company settings" ON public.company_settings;
CREATE POLICY "Users can manage their own company settings" ON public.company_settings
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = company_settings.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = company_settings.user_id
  )
);

-- ===== COMPANIES (allow employees to read their company) =====
DROP POLICY IF EXISTS "employees_view_own_company" ON public.companies;
CREATE POLICY "employees_view_own_company" ON public.companies
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND cm.company_id = companies.id
  )
);

-- ===== PROMOTIONS =====
DROP POLICY IF EXISTS "Users can manage their own promotions" ON public.promotions;
CREATE POLICY "Users can manage their own promotions" ON public.promotions
FOR ALL TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = promotions.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.auth_user_id = auth.uid()
    AND cm.is_active = true
    AND c.owner_id = promotions.user_id
  )
);
