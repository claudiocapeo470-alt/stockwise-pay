-- Table activity_logs : audit trail immuable de toutes les actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  user_id UUID,
  member_id UUID,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX idx_activity_logs_company_created ON public.activity_logs (company_id, created_at DESC);
CREATE INDEX idx_activity_logs_user_created ON public.activity_logs (user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action ON public.activity_logs (action);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs (entity_type, entity_id);

-- Active RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Lecture : owners voient les logs de leur company
CREATE POLICY "Owners view their company logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  company_id IS NOT NULL
  AND public.is_company_owner(company_id, auth.uid())
);

-- Lecture : membres voient leurs propres logs
CREATE POLICY "Members view their own logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Lecture : admins plateforme voient tout
CREATE POLICY "Platform admins view all logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insertion : utilisateurs authentifiés peuvent logger leurs propres actions
CREATE POLICY "Authenticated users can insert logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (
    company_id IS NOT NULL
    AND (
      public.is_company_owner(company_id, auth.uid())
      OR public.is_active_company_member(company_id, auth.uid())
    )
  )
);

-- Pas de policy UPDATE ni DELETE = logs immuables (audit trail)