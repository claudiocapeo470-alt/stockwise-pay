-- Durcissement sécurité & performance (déjà appliqué sur le projet Supabase fsdfzzhbydlmuiblgkvb le 2026-11-23).
-- Ce fichier sert à garder le dépôt synchronisé avec la base. Il est idempotent.

-- 1) Fonctions d'aide RLS : plus appelables sans connexion
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_active_company_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.member_has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_company_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_company_owner(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.member_has_permission(uuid, text) TO authenticated, service_role;

-- 2) PIN des membres : stockage haché (bcrypt) dans une table non exposée à l'API
CREATE TABLE IF NOT EXISTS public.member_pins (
  member_id uuid PRIMARY KEY REFERENCES public.company_members(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_pins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_pins FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.member_pins TO service_role;

INSERT INTO public.member_pins (member_id, pin_hash)
SELECT id, extensions.crypt(pin_code, extensions.gen_salt('bf', 8))
FROM public.company_members WHERE pin_code IS NOT NULL
ON CONFLICT (member_id) DO NOTHING;

ALTER TABLE public.company_members ALTER COLUMN pin_code DROP NOT NULL;
UPDATE public.company_members SET pin_code = NULL WHERE pin_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.company_members_hash_pin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF NEW.pin_code !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'Le PIN doit contenir exactement 6 chiffres';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.member_pins mp
    JOIN public.company_members cm ON cm.id = mp.member_id
    WHERE cm.company_id = NEW.company_id AND cm.id <> NEW.id
      AND mp.pin_hash = crypt(NEW.pin_code, mp.pin_hash)
  ) THEN
    RAISE EXCEPTION 'Ce PIN est déjà utilisé par un autre membre de l''entreprise';
  END IF;
  INSERT INTO public.member_pins (member_id, pin_hash, updated_at)
  VALUES (NEW.id, crypt(NEW.pin_code, gen_salt('bf', 8)), now())
  ON CONFLICT (member_id) DO UPDATE SET pin_hash = EXCLUDED.pin_hash, updated_at = now();
  UPDATE public.company_members SET pin_code = NULL WHERE id = NEW.id;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.company_members_hash_pin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_company_members_hash_pin_ins ON public.company_members;
CREATE TRIGGER trg_company_members_hash_pin_ins AFTER INSERT ON public.company_members
FOR EACH ROW WHEN (NEW.pin_code IS NOT NULL) EXECUTE FUNCTION public.company_members_hash_pin();
DROP TRIGGER IF EXISTS trg_company_members_hash_pin_upd ON public.company_members;
CREATE TRIGGER trg_company_members_hash_pin_upd AFTER UPDATE OF pin_code ON public.company_members
FOR EACH ROW WHEN (NEW.pin_code IS NOT NULL) EXECUTE FUNCTION public.company_members_hash_pin();

CREATE OR REPLACE FUNCTION public.validate_pin_login(_company_code text, _pin_code text)
RETURNS TABLE(member_id uuid, member_first_name text, member_last_name text, member_photo_url text, member_role_name text, member_permissions jsonb, company_id uuid, company_name text, company_logo_url text, auth_user_id uuid, owner_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  RETURN QUERY
  SELECT cm.id, cm.first_name, cm.last_name, cm.photo_url, cr.name, cr.permissions,
         c.id, c.name, c.logo_url, cm.auth_user_id, c.owner_id
  FROM public.company_members cm
  JOIN public.companies c ON c.id = cm.company_id
  JOIN public.member_pins mp ON mp.member_id = cm.id
  LEFT JOIN public.company_roles cr ON cr.id = cm.role_id
  WHERE c.company_code = _company_code AND cm.is_active = true
    AND mp.pin_hash = crypt(_pin_code, mp.pin_hash)
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_member_pin(_member_id uuid, _pin text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_ok boolean; v_fails integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.company_members
                 WHERE id = _member_id AND auth_user_id = auth.uid() AND is_active = true) THEN
    RETURN false;
  END IF;
  SELECT count(*) INTO v_fails FROM public.rate_limit_attempts
  WHERE identifier = _member_id::text AND action_type = 'pin_unlock'
    AND attempted_at > now() - interval '15 minutes';
  IF v_fails >= 5 THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.member_pins mp
                 WHERE mp.member_id = _member_id AND mp.pin_hash = crypt(_pin, mp.pin_hash)) INTO v_ok;
  IF v_ok THEN
    DELETE FROM public.rate_limit_attempts WHERE identifier = _member_id::text AND action_type = 'pin_unlock';
    RETURN true;
  END IF;
  INSERT INTO public.rate_limit_attempts (identifier, action_type) VALUES (_member_id::text, 'pin_unlock');
  RETURN false;
END;
$$;

-- 3) Codes de réinitialisation : hachés par les fonctions Edge ; recherche d'utilisateur par e-mail
DELETE FROM public.password_reset_codes;

CREATE OR REPLACE FUNCTION public.get_auth_user_id_by_email(_email text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_auth_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_id_by_email(text) TO service_role;

-- 4) Numérotation des documents : max+1, verrou, contrôle d'accès, unicité pour les nouveaux documents
CREATE OR REPLACE FUNCTION public.generate_document_number(
  _user_id uuid, _document_type public.document_type,
  _year integer DEFAULT (EXTRACT(year FROM CURRENT_DATE))::integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _prefix text; _next integer;
BEGIN
  IF auth.uid() IS NULL OR (auth.uid() <> _user_id AND NOT EXISTS (
      SELECT 1 FROM public.company_members cm JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.auth_user_id = auth.uid() AND cm.is_active = true AND c.owner_id = _user_id)) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  _prefix := CASE WHEN _document_type = 'facture' THEN 'FAC' WHEN _document_type = 'devis' THEN 'DEV' ELSE 'DOC' END;
  PERFORM pg_advisory_xact_lock(hashtext(_user_id::text || ':' || _document_type::text || ':' || _year::text));
  SELECT COALESCE(MAX((regexp_match(document_number, '^[A-Z]+-' || _year::text || '-([0-9]+)$'))[1]::integer), 0) + 1
  INTO _next FROM public.invoices WHERE user_id = _user_id AND document_type = _document_type;
  RETURN _prefix || '-' || _year || '-' || LPAD(_next::text, 3, '0');
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_unique_document_number_new
ON public.invoices (user_id, document_type, document_number)
WHERE created_at >= '2026-11-23 00:00:00+00';

-- 5) Nettoyage nocturne des tentatives et codes expirés
SELECT cron.schedule('cleanup-auth-throttle', '0 3 * * *',
  $$DELETE FROM public.rate_limit_attempts WHERE attempted_at < now() - interval '1 day';
    DELETE FROM public.password_reset_codes WHERE expires_at < now() - interval '1 day';$$);

-- 6) Performance : politiques RLS (select auth.uid()) et index sur clés étrangères
--    (appliqués par un bloc DO sur la base ; voir la migration perf_rls_initplan_and_fk_indexes)
