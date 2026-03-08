
-- Add moderation fields to sales table
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS sale_tier TEXT NOT NULL DEFAULT 'major',
  ADD COLUMN IF NOT EXISTS importance_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS filter_reason TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS source_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS grouped_page_count INTEGER NOT NULL DEFAULT 0;

-- Index for admin filtering
CREATE INDEX IF NOT EXISTS idx_sales_review_status ON public.sales(review_status);
CREATE INDEX IF NOT EXISTS idx_sales_publish_status ON public.sales(publish_status);
CREATE INDEX IF NOT EXISTS idx_sales_sale_tier ON public.sales(sale_tier);
CREATE INDEX IF NOT EXISTS idx_sales_importance_score ON public.sales(importance_score DESC);
