
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '익명',
  avatar_url text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Create user_roles table (following security best practices)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user_roles" ON public.user_roles
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify user_roles" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 5. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '익명'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  -- Default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 6. Add author_id columns to community tables (nullable for existing data)
ALTER TABLE public.community_posts ADD COLUMN author_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.community_comments ADD COLUMN author_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.community_upvotes ADD COLUMN user_id uuid REFERENCES public.profiles(id);

-- 7. Update community_posts RLS: anyone reads, only authenticated can insert/update/delete own
DROP POLICY IF EXISTS "Allow insert community_posts" ON public.community_posts;
CREATE POLICY "Authenticated users can insert community_posts" ON public.community_posts
FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid());

-- 8. Update community_comments RLS: anyone reads, only authenticated can insert
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.community_comments;
CREATE POLICY "Authenticated users can insert comments" ON public.community_comments
FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid());

-- 9. Update community_upvotes RLS: only authenticated can insert
DROP POLICY IF EXISTS "Anyone can insert upvotes" ON public.community_upvotes;
CREATE POLICY "Authenticated users can insert upvotes" ON public.community_upvotes
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 10. Add unique constraint for user-based upvotes (one per user per post)
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_upvotes_user_post 
ON public.community_upvotes (user_id, post_id) WHERE user_id IS NOT NULL;
