-- Drop the old constraint
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- Add new constraint with all accepted values including those from sales form
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN (
  'especes', 'Espèces',
  'orange_money', 'Mobile Money',
  'mtn_money', 
  'wave', 
  'moov_money',
  'carte_bancaire', 'Carte bancaire',
  'Virement',
  'Chèque',
  'Autre'
));