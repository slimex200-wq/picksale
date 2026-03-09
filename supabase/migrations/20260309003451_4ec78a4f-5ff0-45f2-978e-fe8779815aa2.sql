
-- ============================================================
-- 1. sales: only admin can insert/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;
DROP POLICY IF EXISTS "Public can delete sales" ON public.sales;

CREATE POLICY "Admin can insert sales" ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update sales" ON public.sales
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete sales" ON public.sales
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2. sale_events: only admin can insert/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert sale_events" ON public.sale_events;
DROP POLICY IF EXISTS "Authenticated users can update sale_events" ON public.sale_events;
DROP POLICY IF EXISTS "Authenticated users can delete sale_events" ON public.sale_events;

CREATE POLICY "Admin can insert sale_events" ON public.sale_events
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update sale_events" ON public.sale_events
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete sale_events" ON public.sale_events
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 3. sale_signals: only admin can insert/update/delete (except trigger inserts via security definer)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert sale_signals" ON public.sale_signals;
DROP POLICY IF EXISTS "Authenticated users can update sale_signals" ON public.sale_signals;
DROP POLICY IF EXISTS "Authenticated users can delete sale_signals" ON public.sale_signals;

CREATE POLICY "Admin can insert sale_signals" ON public.sale_signals
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update sale_signals" ON public.sale_signals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete sale_signals" ON public.sale_signals
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. sale_submissions: anyone can insert, only admin can view/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.sale_submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.sale_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON public.sale_submissions;

CREATE POLICY "Admin can view submissions" ON public.sale_submissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update submissions" ON public.sale_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete submissions" ON public.sale_submissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5. community_posts: update/delete = author or admin
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can update community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can delete community_posts" ON public.community_posts;

CREATE POLICY "Author or admin can update community_posts" ON public.community_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Author or admin can delete community_posts" ON public.community_posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 6. community_comments: delete = author or admin
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can delete comments" ON public.community_comments;

CREATE POLICY "Author or admin can delete comments" ON public.community_comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 7. event_aliases: only admin can insert/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert event_aliases" ON public.event_aliases;
DROP POLICY IF EXISTS "Authenticated can update event_aliases" ON public.event_aliases;
DROP POLICY IF EXISTS "Authenticated can delete event_aliases" ON public.event_aliases;

CREATE POLICY "Admin can insert event_aliases" ON public.event_aliases
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update event_aliases" ON public.event_aliases
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete event_aliases" ON public.event_aliases
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 8. platform_scrape_rules: only admin can insert/update/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert platform_scrape_rules" ON public.platform_scrape_rules;
DROP POLICY IF EXISTS "Authenticated can update platform_scrape_rules" ON public.platform_scrape_rules;
DROP POLICY IF EXISTS "Authenticated can delete platform_scrape_rules" ON public.platform_scrape_rules;

CREATE POLICY "Admin can insert platform_scrape_rules" ON public.platform_scrape_rules
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update platform_scrape_rules" ON public.platform_scrape_rules
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete platform_scrape_rules" ON public.platform_scrape_rules
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 9. Fix user_roles policy to use has_role function (avoid recursion)
-- ============================================================
DROP POLICY IF EXISTS "Only admins can modify user_roles" ON public.user_roles;

CREATE POLICY "Only admins can modify user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
