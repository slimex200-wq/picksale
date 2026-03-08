
-- Drop restrictive policies and recreate as permissive for sales
DROP POLICY IF EXISTS "Anyone can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;

CREATE POLICY "Anyone can view sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales" ON public.sales FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sales" ON public.sales FOR DELETE TO authenticated USING (true);

-- Fix community_posts policies too
DROP POLICY IF EXISTS "Anyone can view community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow insert via service role or authenticated" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can update community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can delete community_posts" ON public.community_posts;

CREATE POLICY "Anyone can view community_posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow insert community_posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update community_posts" ON public.community_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete community_posts" ON public.community_posts FOR DELETE TO authenticated USING (true);

-- Fix sale_submissions policies too
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.sale_submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.sale_submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.sale_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON public.sale_submissions;

CREATE POLICY "Anyone can insert submissions" ON public.sale_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view submissions" ON public.sale_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update submissions" ON public.sale_submissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete submissions" ON public.sale_submissions FOR DELETE TO authenticated USING (true);
