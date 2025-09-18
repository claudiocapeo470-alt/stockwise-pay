-- Fix critical security vulnerability: password_reset_codes table has overly permissive RLS policies
-- Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can view their own password reset codes" ON public.password_reset_codes;
DROP POLICY IF EXISTS "Anyone can update their own password reset codes" ON public.password_reset_codes; 
DROP POLICY IF EXISTS "Anyone can insert password reset codes" ON public.password_reset_codes;

-- Create secure policies that only allow edge functions (service role) to access
-- This prevents any authenticated or unauthenticated user from directly accessing reset codes
CREATE POLICY "Only service role can manage password reset codes"
ON public.password_reset_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add automatic cleanup of expired codes (security best practice)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_codes 
  WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a more secure function to verify reset codes (used by edge functions)
CREATE OR REPLACE FUNCTION public.verify_reset_code(_email text, _code text)
RETURNS TABLE(id uuid, email text, code text, expires_at timestamptz, used boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT prc.id, prc.email, prc.code, prc.expires_at, prc.used
  FROM public.password_reset_codes prc
  WHERE prc.email = _email 
    AND prc.code = _code 
    AND prc.expires_at > now() 
    AND prc.used = false
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better performance on cleanup and verification
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_code ON public.password_reset_codes(email, code);

-- Add trigger for automatic cleanup of old codes (run daily)
-- Note: This would typically be set up as a scheduled job, but we'll add the function for manual cleanup