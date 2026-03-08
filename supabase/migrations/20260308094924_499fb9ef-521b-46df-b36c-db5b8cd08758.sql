
-- Create sale_submissions table for user-submitted sale tips
CREATE TABLE public.sale_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT,
  sale_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  category TEXT,
  link TEXT NOT NULL DEFAULT '',
  description TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sale_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert submissions
CREATE POLICY "Anyone can insert submissions"
  ON public.sale_submissions FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can view submissions
CREATE POLICY "Authenticated users can view submissions"
  ON public.sale_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admin) can update submissions
CREATE POLICY "Authenticated users can update submissions"
  ON public.sale_submissions FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admin) can delete submissions
CREATE POLICY "Authenticated users can delete submissions"
  ON public.sale_submissions FOR DELETE
  TO authenticated
  USING (true);

-- Remove public insert on sales table (keep only for authenticated)
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;

CREATE POLICY "Authenticated users can insert sales"
  ON public.sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index for filtering by status
CREATE INDEX idx_sale_submissions_status ON public.sale_submissions (status);
CREATE INDEX idx_sale_submissions_created_at ON public.sale_submissions (created_at);
