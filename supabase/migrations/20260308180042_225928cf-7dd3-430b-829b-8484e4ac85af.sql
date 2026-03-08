
-- 1. Add new columns to community_posts
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signal_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_sale_signal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Rename 'link' to 'external_link' for clarity
ALTER TABLE public.community_posts RENAME COLUMN link TO external_link;

-- Update review_status default to 'published' (community posts are public by default)
ALTER TABLE public.community_posts ALTER COLUMN review_status SET DEFAULT 'published';

-- 2. Create community_comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '익명',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can delete comments" ON public.community_comments FOR DELETE USING (true);

-- 3. Create community_upvotes table (tracks unique upvotes by fingerprint)
CREATE TABLE public.community_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, fingerprint)
);

ALTER TABLE public.community_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view upvotes" ON public.community_upvotes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert upvotes" ON public.community_upvotes FOR INSERT WITH CHECK (true);

-- 4. Indexes
CREATE INDEX idx_community_posts_category ON public.community_posts USING GIN (category);
CREATE INDEX idx_community_posts_upvotes ON public.community_posts(upvotes DESC);
CREATE INDEX idx_community_posts_signal_score ON public.community_posts(signal_score DESC);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_upvotes_post_id ON public.community_upvotes(post_id);

-- 5. Function to recalculate signal_score
CREATE OR REPLACE FUNCTION public.recalc_signal_score(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_upvotes INTEGER;
  v_comments INTEGER;
  v_score INTEGER;
  v_category TEXT[];
  v_title TEXT;
  v_content TEXT;
  v_link TEXT;
  v_platform TEXT;
  v_already_signal BOOLEAN;
BEGIN
  SELECT upvotes, comments_count, category, title, content, external_link, platform, is_sale_signal
  INTO v_upvotes, v_comments, v_category, v_title, v_content, v_link, v_platform, v_already_signal
  FROM community_posts WHERE id = p_post_id;

  -- Score = upvotes * 2 + comments
  v_score := (v_upvotes * 2) + v_comments;

  UPDATE community_posts SET signal_score = v_score, updated_at = now() WHERE id = p_post_id;

  -- Auto-create sale_signal if threshold met and not already flagged
  IF NOT v_already_signal AND (
    (v_upvotes >= 5 AND 'sale_info' = ANY(v_category))
    OR (v_upvotes >= 5 AND 'hot_deal' = ANY(v_category))
    OR v_score >= 15
  ) THEN
    INSERT INTO sale_signals (platform, source_type, source_url, raw_title, raw_text, confidence, review_status)
    VALUES (
      COALESCE(v_platform, '커뮤니티 핫딜'),
      'community',
      COALESCE(v_link, ''),
      v_title,
      COALESCE(v_content, ''),
      LEAST(v_score::real / 20.0, 1.0),
      'pending'
    );

    UPDATE community_posts SET is_sale_signal = true WHERE id = p_post_id;
  END IF;
END;
$$;
