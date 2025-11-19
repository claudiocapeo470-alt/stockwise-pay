-- Table pour l'historique des connexions des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true
);

-- Index pour améliorer les performances
CREATE INDEX idx_user_login_history_user_id ON public.user_login_history(user_id);
CREATE INDEX idx_user_login_history_login_at ON public.user_login_history(login_at DESC);

-- RLS pour la table user_login_history
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les admins peuvent voir l'historique des connexions
CREATE POLICY "Admins can view login history"
  ON public.user_login_history
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Table pour l'historique des mouvements de stock
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment', 'sale')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);

-- RLS pour stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Utilisateurs peuvent voir leurs propres mouvements
CREATE POLICY "Users can view their own stock movements"
  ON public.stock_movements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins peuvent voir tous les mouvements
CREATE POLICY "Admins can view all stock movements"
  ON public.stock_movements
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger pour enregistrer automatiquement les mouvements de stock lors des ventes
CREATE OR REPLACE FUNCTION public.log_stock_movement_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_qty INTEGER;
  new_qty INTEGER;
  prod_user_id UUID;
BEGIN
  -- Récupérer la quantité précédente et le user_id du produit
  SELECT quantity, user_id INTO prev_qty, prod_user_id
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- Calculer la nouvelle quantité
  new_qty := prev_qty - NEW.quantity;
  
  -- Enregistrer le mouvement
  INSERT INTO public.stock_movements (
    product_id,
    user_id,
    movement_type,
    quantity,
    previous_quantity,
    new_quantity,
    reason,
    created_by
  ) VALUES (
    NEW.product_id,
    prod_user_id,
    'sale',
    NEW.quantity,
    prev_qty,
    new_qty,
    'Vente',
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Attacher le trigger aux ventes
DROP TRIGGER IF EXISTS trigger_log_stock_movement_on_sale ON public.sales;
CREATE TRIGGER trigger_log_stock_movement_on_sale
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.log_stock_movement_on_sale();

-- Table pour l'historique des emails envoyés
CREATE TABLE IF NOT EXISTS public.email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all', 'subscribed', 'specific')),
  recipient_email TEXT,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_recipients INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Index
CREATE INDEX idx_email_history_sent_at ON public.email_history(sent_at DESC);
CREATE INDEX idx_email_history_sent_by ON public.email_history(sent_by);

-- RLS
ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email history"
  ON public.email_history
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Ajouter colonne account_status sur profiles si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'account_status') THEN
    ALTER TABLE public.profiles ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended'));
  END IF;
END $$;