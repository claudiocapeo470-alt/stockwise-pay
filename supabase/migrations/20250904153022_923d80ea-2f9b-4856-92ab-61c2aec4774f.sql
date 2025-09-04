-- Fix security warning by setting search_path for the function
ALTER FUNCTION public.calculate_remaining_amount() SET search_path = 'public';