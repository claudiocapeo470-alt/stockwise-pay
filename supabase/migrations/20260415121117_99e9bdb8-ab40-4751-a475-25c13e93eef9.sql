-- CRITICAL: Remove overly permissive deny_anonymous_access policies
-- These use USING (auth.uid() IS NOT NULL) which, when ORed with existing policies,
-- grants every authenticated user read access to ALL rows across ALL tenants.

DROP POLICY IF EXISTS "deny_anonymous_access_payments" ON public.payments;
DROP POLICY IF EXISTS "deny_anonymous_access_invoices" ON public.invoices;
DROP POLICY IF EXISTS "deny_anonymous_access_sales" ON public.sales;
DROP POLICY IF EXISTS "deny_anonymous_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "deny_anonymous_access_company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "deny_anonymous_access_subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "deny_anonymous_access_products" ON public.products;
DROP POLICY IF EXISTS "deny_anonymous_access_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "deny_anonymous_access_password_reset_codes" ON public.password_reset_codes;