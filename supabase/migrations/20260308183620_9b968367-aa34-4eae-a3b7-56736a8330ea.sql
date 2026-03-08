
-- Trigger: auto-recalculate signal_score on upvote insert
CREATE OR REPLACE FUNCTION public.trigger_recalc_on_upvote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update upvotes count
  UPDATE community_posts
  SET upvotes = (SELECT COUNT(*) FROM community_upvotes WHERE post_id = NEW.post_id)
  WHERE id = NEW.post_id;
  
  -- Recalculate signal score
  PERFORM recalc_signal_score(NEW.post_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalc_on_upvote
AFTER INSERT ON public.community_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalc_on_upvote();

-- Trigger: auto-recalculate signal_score on comment insert/delete
CREATE OR REPLACE FUNCTION public.trigger_recalc_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_post_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_post_id := OLD.post_id;
  ELSE
    v_post_id := NEW.post_id;
  END IF;

  -- Update comments_count
  UPDATE community_posts
  SET comments_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = v_post_id)
  WHERE id = v_post_id;

  -- Recalculate signal score
  PERFORM recalc_signal_score(v_post_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalc_on_comment
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalc_on_comment();
