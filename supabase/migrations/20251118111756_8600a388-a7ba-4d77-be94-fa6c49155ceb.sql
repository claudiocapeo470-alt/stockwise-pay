-- Ajouter automatiquement le rôle admin à l'utilisateur avec l'email spécifié
-- Cette fonction s'exécutera après chaque inscription pour vérifier si c'est l'admin

CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si l'email correspond à l'admin, ajouter le rôle admin
  IF NEW.email = 'deschamp.deschamp001@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger qui s'exécute après l'insertion d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();

-- Attribuer le rôle admin à l'utilisateur existant s'il existe déjà
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'deschamp.deschamp001@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Commenter la fonction pour la documentation
COMMENT ON FUNCTION public.assign_admin_role() IS 'Attribue automatiquement le rôle admin à l''utilisateur avec l''email deschamp.deschamp001@gmail.com';