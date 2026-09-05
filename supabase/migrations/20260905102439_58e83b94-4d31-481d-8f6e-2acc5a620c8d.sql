-- Met à jour la fonction de création des données par défaut pour inclure "sales"
-- sur les rôles Manager et Gestionnaire Stock dès la création d'une entreprise.
CREATE OR REPLACE FUNCTION public.create_default_company_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_services (company_id, name, color, icon, sort_order) VALUES
    (NEW.id, 'Caisse', '#4F46E5', '🖥️', 1),
    (NEW.id, 'Stock', '#10B981', '📦', 2),
    (NEW.id, 'Boutique', '#F59E0B', '🛍️', 3),
    (NEW.id, 'Livraison', '#EF4444', '🚚', 4),
    (NEW.id, 'Management', '#8B5CF6', '📊', 5);

  INSERT INTO public.company_roles (company_id, name, is_system, permissions) VALUES
    (NEW.id, 'Admin', true, '{"all": true}'),
    (NEW.id, 'Caissier', true, '{"pos": true, "sales_history": true, "customers_read": true}'),
    (NEW.id, 'Gestionnaire Stock', true, '{"stock": true, "purchases": true, "reports_stock": true, "sales": true}'),
    (NEW.id, 'Livreur', true, '{"deliveries_own": true}'),
    (NEW.id, 'Manager', true, '{"reports": true, "team_read": true, "boutique_read": true, "sales_read": true, "deliveries": true, "sales": true}'),
    (NEW.id, 'Vendeur', true, '{"boutique_orders": true, "deliveries_assign": true, "catalog_read": true}');

  RETURN NEW;
END;
$$;

-- Applique rétroactivement la permission "sales" aux rôles système existants
-- Manager et Gestionnaire (Stock, Commandes, Fusionné) si elle manque.
UPDATE public.company_roles
SET permissions = permissions || '{"sales": true}'::jsonb
WHERE is_system = true
  AND name IN ('Manager', 'Gestionnaire Stock', 'Gestionnaire Commandes', 'Gestionnaire Fusionné')
  AND COALESCE((permissions ->> 'sales')::boolean, false) = false;