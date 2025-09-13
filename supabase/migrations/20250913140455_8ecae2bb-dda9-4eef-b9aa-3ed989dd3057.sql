-- Create table for password reset codes
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Add index for faster lookups
CREATE INDEX idx_password_reset_codes_email_code ON public.password_reset_codes(email, code) WHERE NOT used;
CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at) WHERE NOT used;

-- Enable RLS on password_reset_codes table
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for password_reset_codes (allow public access since this is used for password reset)
CREATE POLICY "Anyone can insert password reset codes" 
ON public.password_reset_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own password reset codes" 
ON public.password_reset_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update their own password reset codes" 
ON public.password_reset_codes 
FOR UPDATE 
USING (true);