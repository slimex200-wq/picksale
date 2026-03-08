
-- 1. Create event_aliases table
CREATE TABLE public.event_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  alias TEXT NOT NULL,
  UNIQUE(platform, alias)
);

ALTER TABLE public.event_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view event_aliases" ON public.event_aliases FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert event_aliases" ON public.event_aliases FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update event_aliases" ON public.event_aliases FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete event_aliases" ON public.event_aliases FOR DELETE USING (true);

-- 2. Create platform_scrape_rules table
CREATE TABLE public.platform_scrape_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  surface_type TEXT NOT NULL DEFAULT 'homepage',
  page_url TEXT NOT NULL DEFAULT '',
  card_selector TEXT NOT NULL DEFAULT '',
  title_selector TEXT NOT NULL DEFAULT '',
  link_selector TEXT NOT NULL DEFAULT '',
  date_selector TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.platform_scrape_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view platform_scrape_rules" ON public.platform_scrape_rules FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert platform_scrape_rules" ON public.platform_scrape_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update platform_scrape_rules" ON public.platform_scrape_rules FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete platform_scrape_rules" ON public.platform_scrape_rules FOR DELETE USING (true);

-- 3. Add signal_id to sales for traceability
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS signal_id UUID REFERENCES public.sale_signals(id) ON DELETE SET NULL;

-- 4. Indexes
CREATE INDEX idx_event_aliases_platform ON public.event_aliases(platform);
CREATE INDEX idx_event_aliases_alias ON public.event_aliases(alias);
CREATE INDEX idx_scrape_rules_platform ON public.platform_scrape_rules(platform);
CREATE INDEX idx_sales_signal_id ON public.sales(signal_id);
