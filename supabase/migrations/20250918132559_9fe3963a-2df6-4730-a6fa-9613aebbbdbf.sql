-- Fix security warnings: Set proper search_path for functions created in previous migration
-- Update cleanup function with proper search path
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Update verify function with proper search path  
CREATE OR REPLACE FUNCTION public.verify_reset_code(_email text, _code text)
RETURNS TABLE(id uuid, email text, code text, expires_at timestamptz, used boolean) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;