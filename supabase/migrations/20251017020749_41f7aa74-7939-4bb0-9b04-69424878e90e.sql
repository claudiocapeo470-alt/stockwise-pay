-- Sécurisation des tables : bloquer l'accès anonyme aux données sensibles

-- 1. Table profiles : bloquer l'accès public aux emails
CREATE POLICY "deny_anonymous_access_profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Table company_settings : protéger les informations de l'entreprise
CREATE POLICY "deny_anonymous_access_company_settings" 
ON public.company_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Table invoices : protéger les données clients et financières
CREATE POLICY "deny_anonymous_access_invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Table payments : protéger les enregistrements de paiement
CREATE POLICY "deny_anonymous_access_payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Table sales : protéger les données de ventes
CREATE POLICY "deny_anonymous_access_sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Table subscribers : protéger les emails des abonnés
CREATE POLICY "deny_anonymous_access_subscribers" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 7. Table products : protéger les prix et inventaire
CREATE POLICY "deny_anonymous_access_products" 
ON public.products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 8. Table password_reset_codes : protéger les codes de réinitialisation
CREATE POLICY "deny_anonymous_access_password_reset_codes" 
ON public.password_reset_codes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 9. Table user_roles : protéger les rôles des utilisateurs
CREATE POLICY "deny_anonymous_access_user_roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);