CREATE OR REPLACE FUNCTION public.get_subscription_pricing()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _value jsonb;
BEGIN
  SELECT value INTO _value
  FROM public.ceo_settings
  WHERE key = 'subscription_pricing'
  LIMIT 1;

  IF _value IS NULL THEN
    RETURN jsonb_build_object(
      'starter', 9900,
      'business', 24900,
      'pro', 49900
    );
  END IF;

  RETURN jsonb_build_object(
    'starter', COALESCE((_value->>'starter')::int, 9900),
    'business', COALESCE((_value->>'business')::int, 24900),
    'pro', COALESCE((_value->>'pro')::int, 49900)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_subscription_pricing() TO anon, authenticated;