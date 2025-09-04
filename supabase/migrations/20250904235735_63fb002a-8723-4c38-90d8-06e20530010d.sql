-- Fix the payment_method check constraint to accept the correct values
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_payment_method_check;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('especes', 'orange_money', 'mtn_money', 'wave', 'moov_money', 'carte_bancaire'));