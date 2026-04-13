CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = _company_id
      AND c.owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = _company_id
      AND cm.auth_user_id = _user_id
      AND cm.is_active = true
  );
$$;

DROP POLICY IF EXISTS "employees_view_own_company" ON public.companies;
CREATE POLICY "employees_view_own_company"
ON public.companies
FOR SELECT
TO authenticated
USING (public.is_active_company_member(id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_members" ON public.company_members;
CREATE POLICY "owners_manage_members"
ON public.company_members
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_services" ON public.company_services;
CREATE POLICY "owners_manage_services"
ON public.company_services
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_roles" ON public.company_roles;
CREATE POLICY "owners_manage_roles"
ON public.company_roles
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_locks" ON public.lock_sessions;
CREATE POLICY "owners_manage_locks"
ON public.lock_sessions
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_deliveries" ON public.deliveries;
CREATE POLICY "owners_manage_deliveries"
ON public.deliveries
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));

DROP POLICY IF EXISTS "owners_manage_notifications" ON public.notifications;
CREATE POLICY "owners_manage_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));