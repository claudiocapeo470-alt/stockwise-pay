-- Fix critical security vulnerability in password_reset_codes table
-- The current RLS policy allows unrestricted access which could allow attackers to steal reset codes

-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Only service role can manage password reset codes" ON public.password_reset_codes;

-- Create a proper restrictive policy that prevents any client access
-- Only service role (used by edge functions) can access this table
CREATE POLICY "Restrict password reset codes access" 
ON public.password_reset_codes 
FOR ALL 
USING (false)  -- Deny all client access
WITH CHECK (false);  -- Deny all client modifications

-- Add a comment explaining the security rationale
COMMENT ON TABLE public.password_reset_codes IS 'Contains sensitive password reset codes. Access restricted to service role only via edge functions for security.';