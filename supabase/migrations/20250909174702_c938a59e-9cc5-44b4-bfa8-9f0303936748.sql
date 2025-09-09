-- Insérer un profil pour l'utilisateur actuel s'il n'existe pas
INSERT INTO public.profiles (user_id, email, created_at, updated_at)
SELECT 
    '0fe72481-b137-4594-813f-a924f7e161c9',
    'deschamp.deschamp222@gmail.com',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = '0fe72481-b137-4594-813f-a924f7e161c9'
);

-- Créer une fonction pour automatiquement créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();