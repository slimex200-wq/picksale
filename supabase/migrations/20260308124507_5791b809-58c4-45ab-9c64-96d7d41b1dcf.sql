
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text,
  title text NOT NULL,
  content text,
  link text NOT NULL DEFAULT '',
  category text[] NOT NULL DEFAULT '{}',
  author text,
  source_type text,
  review_status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community_posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update community_posts" ON public.community_posts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete community_posts" ON public.community_posts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow insert via service role or authenticated" ON public.community_posts
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_community_posts_review_status ON public.community_posts (review_status);
CREATE INDEX idx_community_posts_link ON public.community_posts (link);
