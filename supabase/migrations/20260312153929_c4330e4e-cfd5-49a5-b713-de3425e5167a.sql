
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, sale_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
