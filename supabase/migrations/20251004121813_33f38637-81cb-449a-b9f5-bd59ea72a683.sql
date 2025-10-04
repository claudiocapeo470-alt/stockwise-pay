-- Add paid_amount column to sales table
ALTER TABLE public.sales 
ADD COLUMN paid_amount numeric NOT NULL DEFAULT 0;

-- Create function to automatically create payment from sale
CREATE OR REPLACE FUNCTION public.create_payment_from_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create payment if paid_amount > 0
  IF NEW.paid_amount > 0 THEN
    INSERT INTO public.payments (
      user_id,
      sale_id,
      customer_name,
      customer_phone,
      total_amount,
      paid_amount,
      remaining_amount,
      payment_method,
      status,
      payment_date,
      created_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.customer_name,
      NEW.customer_phone,
      NEW.total_amount,
      NEW.paid_amount,
      NEW.total_amount - NEW.paid_amount,
      NEW.payment_method,
      'completed',
      NEW.sale_date,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create payment after sale insert
CREATE TRIGGER trigger_create_payment_from_sale
AFTER INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.create_payment_from_sale();