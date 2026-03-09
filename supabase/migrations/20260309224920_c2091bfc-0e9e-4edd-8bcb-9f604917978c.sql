
-- ===== MULTI-TENANT: Companies, Services, Roles, Members, Deliveries =====

-- 1. Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  company_code VARCHAR(6) NOT NULL UNIQUE,
  logo_url TEXT,
  lock_timeout_minutes INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Company services (departments)
CREATE TABLE public.company_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT '📦',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Company roles
CREATE TABLE public.company_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_id UUID REFERENCES public.company_services(id) ON DELETE SET NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Company members (employees with PIN)
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  auth_user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT,
  photo_url TEXT,
  service_id UUID REFERENCES public.company_services(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.company_roles(id) ON DELETE SET NULL,
  pin_code VARCHAR(6) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, pin_code)
);

-- 5. Lock sessions
CREATE TABLE public.lock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.company_members(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlocked_at TIMESTAMPTZ
);

-- 6. Deliveries (for online store orders)
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  store_order_id UUID REFERENCES public.store_orders(id) ON DELETE SET NULL,
  driver_member_id UUID REFERENCES public.company_members(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unassigned',
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  problem_reason TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== FUNCTIONS =====

-- Generate unique 6-digit company code
CREATE OR REPLACE FUNCTION public.generate_company_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Auto-set company code before insert
CREATE OR REPLACE FUNCTION public.set_company_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_code IS NULL OR NEW.company_code = '' THEN
    NEW.company_code := public.generate_company_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_company_code
BEFORE INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.set_company_code();

-- Auto-create default services & roles when company is created
CREATE OR REPLACE FUNCTION public.create_default_company_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_services (company_id, name, color, icon, sort_order) VALUES
    (NEW.id, 'Caisse', '#4F46E5', '🖥️', 1),
    (NEW.id, 'Stock', '#10B981', '📦', 2),
    (NEW.id, 'Boutique', '#F59E0B', '🛍️', 3),
    (NEW.id, 'Livraison', '#EF4444', '🚚', 4),
    (NEW.id, 'Management', '#8B5CF6', '📊', 5);

  INSERT INTO public.company_roles (company_id, name, is_system, permissions) VALUES
    (NEW.id, 'Admin', true, '{"all": true}'),
    (NEW.id, 'Caissier', true, '{"pos": true, "sales_history": true, "customers_read": true}'),
    (NEW.id, 'Gestionnaire Stock', true, '{"stock": true, "purchases": true, "reports_stock": true}'),
    (NEW.id, 'Livreur', true, '{"deliveries_own": true}'),
    (NEW.id, 'Manager', true, '{"reports": true, "team_read": true, "boutique_read": true, "sales_read": true, "deliveries": true}'),
    (NEW.id, 'Vendeur', true, '{"boutique_orders": true, "deliveries_assign": true, "catalog_read": true}');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_default_company_data
AFTER INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.create_default_company_data();

-- ===== RLS =====
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Companies: owner can manage
CREATE POLICY "owners_manage_company" ON public.companies
FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Allow insert for any authenticated user (to create their company)
CREATE POLICY "users_can_create_company" ON public.companies
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Services: company owner
CREATE POLICY "owners_manage_services" ON public.company_services
FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));

-- Roles: company owner
CREATE POLICY "owners_manage_roles" ON public.company_roles
FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));

-- Members: company owner can manage all
CREATE POLICY "owners_manage_members" ON public.company_members
FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));

-- Members: can view own record
CREATE POLICY "members_view_own" ON public.company_members
FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

-- Lock sessions: company owner can manage
CREATE POLICY "owners_manage_locks" ON public.lock_sessions
FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));

-- Deliveries: company owner
CREATE POLICY "owners_manage_deliveries" ON public.deliveries
FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));

-- Deliveries: assigned driver can view/update
CREATE POLICY "drivers_view_deliveries" ON public.deliveries
FOR SELECT TO authenticated
USING (EXISTS(SELECT 1 FROM company_members WHERE id = driver_member_id AND auth_user_id = auth.uid()));

CREATE POLICY "drivers_update_deliveries" ON public.deliveries
FOR UPDATE TO authenticated
USING (EXISTS(SELECT 1 FROM company_members WHERE id = driver_member_id AND auth_user_id = auth.uid()))
WITH CHECK (EXISTS(SELECT 1 FROM company_members WHERE id = driver_member_id AND auth_user_id = auth.uid()));

-- Function to validate PIN login (used by edge function)
CREATE OR REPLACE FUNCTION public.validate_pin_login(_company_code TEXT, _pin_code TEXT)
RETURNS TABLE(
  member_id UUID,
  member_first_name TEXT,
  member_last_name TEXT,
  member_photo_url TEXT,
  member_role_name TEXT,
  member_permissions JSONB,
  company_id UUID,
  company_name TEXT,
  company_logo_url TEXT,
  auth_user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id AS member_id,
    cm.first_name AS member_first_name,
    cm.last_name AS member_last_name,
    cm.photo_url AS member_photo_url,
    cr.name AS member_role_name,
    cr.permissions AS member_permissions,
    c.id AS company_id,
    c.name AS company_name,
    c.logo_url AS company_logo_url,
    cm.auth_user_id
  FROM public.company_members cm
  JOIN public.companies c ON c.id = cm.company_id
  LEFT JOIN public.company_roles cr ON cr.id = cm.role_id
  WHERE c.company_code = _company_code
    AND cm.pin_code = _pin_code
    AND cm.is_active = true
  LIMIT 1;
END;
$$;
