
-- Drop the old function signature first
DROP FUNCTION IF EXISTS public.validate_pin_login(text, text);

-- Recreate with owner_id in return type
CREATE OR REPLACE FUNCTION public.validate_pin_login(_company_code text, _pin_code text)
 RETURNS TABLE(
   member_id uuid,
   member_first_name text,
   member_last_name text,
   member_photo_url text,
   member_role_name text,
   member_permissions jsonb,
   company_id uuid,
   company_name text,
   company_logo_url text,
   auth_user_id uuid,
   owner_id uuid
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    cm.auth_user_id,
    c.owner_id
  FROM public.company_members cm
  JOIN public.companies c ON c.id = cm.company_id
  LEFT JOIN public.company_roles cr ON cr.id = cm.role_id
  WHERE c.company_code = _company_code
    AND cm.pin_code = _pin_code
    AND cm.is_active = true
  LIMIT 1;
END;
$function$;
