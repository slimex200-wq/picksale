
-- 1. Create sale_signals table
CREATE TABLE public.sale_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'homepage',
  source_url TEXT NOT NULL DEFAULT '',
  raw_title TEXT NOT NULL DEFAULT '',
  raw_text TEXT NOT NULL DEFAULT '',
  detected_keywords TEXT[] NOT NULL DEFAULT '{}',
  detected_discount TEXT NOT NULL DEFAULT '',
  start_date_raw TEXT,
  end_date_raw TEXT,
  confidence REAL NOT NULL DEFAULT 0,
  review_status TEXT NOT NULL DEFAULT 'pending',
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create sale_events table
CREATE TABLE public.sale_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_title TEXT NOT NULL,
  platform TEXT NOT NULL,
  canonical_link TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  importance_score INTEGER NOT NULL DEFAULT 0,
  event_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add event_id to sales table (nullable FK)
ALTER TABLE public.sales ADD COLUMN event_id UUID REFERENCES public.sale_events(id) ON DELETE SET NULL;

-- 4. RLS for sale_signals
ALTER TABLE public.sale_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sale_signals" ON public.sale_signals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sale_signals" ON public.sale_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update sale_signals" ON public.sale_signals FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete sale_signals" ON public.sale_signals FOR DELETE USING (true);

-- 5. RLS for sale_events
ALTER TABLE public.sale_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sale_events" ON public.sale_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sale_events" ON public.sale_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update sale_events" ON public.sale_events FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete sale_events" ON public.sale_events FOR DELETE USING (true);

-- 6. Indexes
CREATE INDEX idx_sale_signals_platform ON public.sale_signals(platform);
CREATE INDEX idx_sale_signals_review_status ON public.sale_signals(review_status);
CREATE INDEX idx_sale_signals_created_at ON public.sale_signals(created_at DESC);
CREATE INDEX idx_sale_events_platform ON public.sale_events(platform);
CREATE INDEX idx_sale_events_status ON public.sale_events(event_status);
CREATE INDEX idx_sales_event_id ON public.sales(event_id);
