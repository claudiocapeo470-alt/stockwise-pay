-- Fix the create_payment_from_sale trigger to include the amount column
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
      amount,
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
      NEW.paid_amount,  -- Set amount to the paid_amount
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