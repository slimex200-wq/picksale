
-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;

-- Create permissive INSERT policy for everyone
CREATE POLICY "Anyone can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (true);
