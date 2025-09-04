-- Add new columns to payments table for complete payment management
ALTER TABLE public.payments 
ADD COLUMN customer_first_name TEXT,
ADD COLUMN customer_last_name TEXT,
ADD COLUMN total_amount NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN paid_amount NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN remaining_amount NUMERIC NOT NULL DEFAULT 0;

-- Update payment_method to have specific values
ALTER TABLE public.payments 
ALTER COLUMN payment_method TYPE TEXT;

-- Update status to have specific values matching requirements
ALTER TABLE public.payments 
ALTER COLUMN status TYPE TEXT;

-- Create a function to automatically calculate remaining amount
CREATE OR REPLACE FUNCTION public.calculate_remaining_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining_amount = NEW.total_amount - NEW.paid_amount;
  
  -- Auto-update status based on payment amounts
  IF NEW.paid_amount = 0 THEN
    NEW.status = 'pending';
  ELSIF NEW.paid_amount >= NEW.total_amount THEN
    NEW.status = 'completed';
    NEW.remaining_amount = 0;
  ELSIF NEW.paid_amount > 0 AND NEW.paid_amount < NEW.total_amount THEN
    NEW.status = 'partial';
  END IF;
  
  -- Check if payment is overdue
  IF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE AND NEW.status != 'completed' THEN
    NEW.status = 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate remaining amount and status
CREATE TRIGGER calculate_payment_trigger
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_remaining_amount();

-- Update existing records to set default values
UPDATE public.payments 
SET 
  total_amount = amount,
  paid_amount = CASE WHEN status = 'completed' THEN amount ELSE 0 END,
  customer_first_name = SPLIT_PART(customer_name, ' ', 1),
  customer_last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(customer_name, ' '), 1) > 1 
    THEN ARRAY_TO_STRING(ARRAY_REMOVE(STRING_TO_ARRAY(customer_name, ' '), SPLIT_PART(customer_name, ' ', 1)), ' ')
    ELSE ''
  END
WHERE customer_name IS NOT NULL;