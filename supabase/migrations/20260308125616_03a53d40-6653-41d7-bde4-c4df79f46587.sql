DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;
CREATE POLICY "Public can delete sales" ON public.sales
FOR DELETE TO public
USING (true);