-- Ajouter le champ payment_method à la table sales
ALTER TABLE sales 
ADD COLUMN payment_method TEXT;

-- Ajouter un commentaire pour décrire la colonne
COMMENT ON COLUMN sales.payment_method IS 'Mode de paiement utilisé pour la vente (Espèces, Mobile Money, Carte, etc.)';
