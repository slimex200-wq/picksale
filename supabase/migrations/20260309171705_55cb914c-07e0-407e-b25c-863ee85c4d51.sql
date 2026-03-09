
-- Add new columns for upsert/dedup logic
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS event_key text DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS latest_pub_date timestamptz;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS latest_source_url text DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS source_type text DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS signal_type text DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT 0;

-- Create unique partial index for platform + event_key dedup (only when event_key is non-empty)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_platform_event_key
  ON public.sales (platform, event_key)
  WHERE event_key IS NOT NULL AND event_key != '';
