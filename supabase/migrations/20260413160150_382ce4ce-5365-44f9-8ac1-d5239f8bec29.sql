
-- 1. Add created_by_member_id to cash_sessions
ALTER TABLE public.cash_sessions
ADD COLUMN IF NOT EXISTS created_by_member_id uuid REFERENCES public.company_members(id);

-- 2. Add created_by_member_id to cash_movements
ALTER TABLE public.cash_movements
ADD COLUMN IF NOT EXISTS created_by_member_id uuid REFERENCES public.company_members(id);

-- 3. Rate limit table for password reset
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Only service_role can access rate_limit_attempts
CREATE POLICY "service_role_only" ON public.rate_limit_attempts
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON public.rate_limit_attempts (identifier, action_type, attempted_at);

-- Auto-cleanup old attempts (> 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_attempts WHERE attempted_at < now() - interval '1 hour';
END;
$$;

-- 4. Notifications: allow active members to SELECT and UPDATE (mark as read)
DROP POLICY IF EXISTS "members_read_notifications" ON public.notifications;
CREATE POLICY "members_read_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = notifications.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
);

DROP POLICY IF EXISTS "members_mark_read_notifications" ON public.notifications;
CREATE POLICY "members_mark_read_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = notifications.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = notifications.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
);

-- 5. Secure PIN verification function (avoids reading pin_code from client)
CREATE OR REPLACE FUNCTION public.verify_member_pin(_member_id uuid, _pin text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE id = _member_id
      AND pin_code = _pin
      AND is_active = true
  );
$$;

-- 6. Grant employees SELECT on company_roles so role info can be joined
DROP POLICY IF EXISTS "members_read_roles" ON public.company_roles;
CREATE POLICY "members_read_roles"
ON public.company_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = company_roles.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
);

-- 7. Grant employees SELECT on company_services
DROP POLICY IF EXISTS "members_read_services" ON public.company_services;
CREATE POLICY "members_read_services"
ON public.company_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = company_services.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
);

-- 8. Grant employees to manage lock_sessions for their own company
DROP POLICY IF EXISTS "members_manage_locks" ON public.lock_sessions;
CREATE POLICY "members_manage_locks"
ON public.lock_sessions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = lock_sessions.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = lock_sessions.company_id
      AND cm.auth_user_id = auth.uid()
      AND cm.is_active = true
  )
);
