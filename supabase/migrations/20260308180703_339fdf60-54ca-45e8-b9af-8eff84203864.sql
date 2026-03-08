
-- 1. Add traceability columns to sale_signals
ALTER TABLE public.sale_signals
  ADD COLUMN IF NOT EXISTS community_post_id uuid REFERENCES public.community_posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS normalized_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS matched_alias text NOT NULL DEFAULT '';

-- 2. Add signal_count to sale_events
ALTER TABLE public.sale_events
  ADD COLUMN IF NOT EXISTS signal_count integer NOT NULL DEFAULT 0;

-- 3. Update recalc_signal_score to populate community_post_id and normalized_title
CREATE OR REPLACE FUNCTION public.recalc_signal_score(p_post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_normalized TEXT;
  v_matched TEXT;
BEGIN
  SELECT upvotes, comments_count, category, title, content, external_link, platform, is_sale_signal
  INTO v_upvotes, v_comments, v_category, v_title, v_content, v_link, v_platform, v_already_signal
  FROM community_posts WHERE id = p_post_id;

  v_score := (v_upvotes * 2) + v_comments;

  UPDATE community_posts SET signal_score = v_score, updated_at = now() WHERE id = p_post_id;

  -- Normalize title: lowercase, trim whitespace
  v_normalized := lower(trim(v_title));

  -- Try to match alias
  SELECT canonical_name INTO v_matched
  FROM event_aliases
  WHERE platform = v_platform AND lower(trim(alias)) = v_normalized
  LIMIT 1;

  IF NOT v_already_signal AND (
    (v_upvotes >= 5 AND 'sale_info' = ANY(v_category))
    OR (v_upvotes >= 5 AND 'hot_deal' = ANY(v_category))
    OR v_score >= 15
  ) THEN
    INSERT INTO sale_signals (
      platform, source_type, source_url, raw_title, raw_text,
      confidence, review_status, community_post_id, normalized_title, matched_alias
    )
    VALUES (
      COALESCE(v_platform, '커뮤니티'),
      'community',
      COALESCE(v_link, ''),
      v_title,
      COALESCE(v_content, ''),
      0.4,  -- community base confidence
      'pending',
      p_post_id,
      v_normalized,
      COALESCE(v_matched, '')
    );

    UPDATE community_posts SET is_sale_signal = true WHERE id = p_post_id;
  END IF;
END;
$function$;

-- 4. Create confidence scoring reference function
COMMENT ON FUNCTION public.recalc_signal_score IS 'Confidence by source_type: detail=0.9, event_hub=0.8, homepage=0.7, news=0.5, community=0.4';
