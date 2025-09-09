-- Fix security vulnerability: Restrict subscription creation to authenticated users only
-- and ensure users can only create subscriptions for themselves

-- Drop the insecure insert policy
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create a secure insert policy that requires authentication and user ownership
CREATE POLICY "Users can create their own subscription"
ON public.subscribers
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Ensure the user is authenticated and can only create subscriptions for themselves
  (auth.uid() IS NOT NULL) AND 
  (
    -- Either user_id matches the authenticated user
    (user_id = auth.uid()) OR 
    -- Or if user_id is null, email must match the authenticated user's email
    (user_id IS NULL AND email = auth.email())
  )
);

-- Also fix the update policy to be more restrictive
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "Users can update their own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  -- Can only update their own subscription records
  (user_id = auth.uid()) OR (email = auth.email())
)
WITH CHECK (
  -- Ensure they can't change ownership to someone else
  (user_id = auth.uid()) OR (email = auth.email())
);