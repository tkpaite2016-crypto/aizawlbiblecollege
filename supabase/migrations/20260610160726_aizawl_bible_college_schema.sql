
/*
# Aizawl Bible College - Full Database Schema

Complete multi-role schema: profiles (RBAC), notices, teachers, downloads,
photos, forum posts/replies, applications, and fee transactions.

Key Features:
- Auto-assigns 'admin' role to tkpaite2016@gmail.com on signup
- All others default to 'standard' role
- Role values: admin | faculty | student | standard
- Student year: 1st_year | 2nd_year | final_year
*/

-- ============================
-- TABLE: profiles (created FIRST so helper functions can reference it)
-- ============================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'standard' CHECK (role IN ('admin', 'faculty', 'student', 'standard')),
  student_year text CHECK (student_year IN ('1st_year', '2nd_year', 'final_year')),
  avatar_url text,
  phone text,
  address text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin')
  );

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin')
  );

-- ============================
-- HELPER FUNCTIONS (after profiles table exists)
-- ============================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_faculty_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'faculty')
  );
$$;

-- ============================
-- TRIGGER: auto-create profile on signup
-- ============================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigned_role text := 'standard';
BEGIN
  IF NEW.email = 'tkpaite2016@gmail.com' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================
-- TABLE: notices
-- ============================
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('academic', 'event', 'general', 'urgent', 'financial')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);

DROP POLICY IF EXISTS "notices_select_published" ON public.notices;
CREATE POLICY "notices_select_published" ON public.notices FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "notices_insert_admin" ON public.notices;
CREATE POLICY "notices_insert_admin" ON public.notices FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notices_update_admin" ON public.notices;
CREATE POLICY "notices_update_admin" ON public.notices FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notices_delete_admin" ON public.notices;
CREATE POLICY "notices_delete_admin" ON public.notices FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- TABLE: teachers
-- ============================
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  qualification text,
  address text,
  subject_in_charge text,
  photo_url text,
  is_current boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  joined_at date,
  left_at date,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_teachers_current ON public.teachers(is_current, display_order);

DROP POLICY IF EXISTS "teachers_select_all" ON public.teachers;
CREATE POLICY "teachers_select_all" ON public.teachers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "teachers_insert_admin" ON public.teachers;
CREATE POLICY "teachers_insert_admin" ON public.teachers FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "teachers_update_admin" ON public.teachers;
CREATE POLICY "teachers_update_admin" ON public.teachers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "teachers_delete_admin" ON public.teachers;
CREATE POLICY "teachers_delete_admin" ON public.teachers FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- TABLE: downloads
-- ============================
CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('academic_calendar', 'syllabus', 'application_form', 'result', 'general', 'policy')),
  semester text,
  file_size_kb integer,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_downloads_category ON public.downloads(category, created_at DESC);

DROP POLICY IF EXISTS "downloads_select_active" ON public.downloads;
CREATE POLICY "downloads_select_active" ON public.downloads FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "downloads_insert_admin" ON public.downloads;
CREATE POLICY "downloads_insert_admin" ON public.downloads FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "downloads_update_admin" ON public.downloads;
CREATE POLICY "downloads_update_admin" ON public.downloads FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "downloads_delete_admin" ON public.downloads;
CREATE POLICY "downloads_delete_admin" ON public.downloads FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- TABLE: photos
-- ============================
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  album text DEFAULT 'General',
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_photos_published ON public.photos(is_published, created_at DESC);

DROP POLICY IF EXISTS "photos_select_published" ON public.photos;
CREATE POLICY "photos_select_published" ON public.photos FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "photos_insert_faculty_admin" ON public.photos;
CREATE POLICY "photos_insert_faculty_admin" ON public.photos FOR INSERT
  TO authenticated WITH CHECK (public.is_faculty_or_admin());

DROP POLICY IF EXISTS "photos_update_admin" ON public.photos;
CREATE POLICY "photos_update_admin" ON public.photos FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "photos_delete_admin" ON public.photos;
CREATE POLICY "photos_delete_admin" ON public.photos FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- TABLE: forum_posts
-- ============================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text DEFAULT 'general',
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);

DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
CREATE POLICY "forum_posts_select" ON public.forum_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "forum_posts_insert" ON public.forum_posts;
CREATE POLICY "forum_posts_insert" ON public.forum_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "forum_posts_update" ON public.forum_posts;
CREATE POLICY "forum_posts_update" ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin())
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "forum_posts_delete" ON public.forum_posts;
CREATE POLICY "forum_posts_delete" ON public.forum_posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id OR public.is_admin());

-- ============================
-- TABLE: forum_replies
-- ============================
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON public.forum_replies(post_id, created_at);

DROP POLICY IF EXISTS "forum_replies_select" ON public.forum_replies;
CREATE POLICY "forum_replies_select" ON public.forum_replies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "forum_replies_insert" ON public.forum_replies;
CREATE POLICY "forum_replies_insert" ON public.forum_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "forum_replies_update" ON public.forum_replies;
CREATE POLICY "forum_replies_update" ON public.forum_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin())
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "forum_replies_delete" ON public.forum_replies;
CREATE POLICY "forum_replies_delete" ON public.forum_replies FOR DELETE
  TO authenticated USING (auth.uid() = author_id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.update_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET reply_count = reply_count + 1, updated_at = now() WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET reply_count = GREATEST(reply_count - 1, 0), updated_at = now() WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_reply_change ON public.forum_replies;
CREATE TRIGGER on_reply_change
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_reply_count();

-- ============================
-- TABLE: applications
-- ============================
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  dob date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  applying_for text,
  previous_education text,
  church_name text,
  pastor_name text,
  statement text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status, submitted_at DESC);

DROP POLICY IF EXISTS "applications_select" ON public.applications;
CREATE POLICY "applications_select" ON public.applications FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "applications_insert_auth" ON public.applications;
CREATE POLICY "applications_insert_auth" ON public.applications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "applications_insert_anon" ON public.applications;
CREATE POLICY "applications_insert_anon" ON public.applications FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "applications_update" ON public.applications;
CREATE POLICY "applications_update" ON public.applications FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "applications_delete_admin" ON public.applications;
CREATE POLICY "applications_delete_admin" ON public.applications FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- TABLE: transactions
-- ============================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  season text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'cheque')),
  reference_no text,
  notes text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id, payment_date DESC);

DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "transactions_insert_admin" ON public.transactions;
CREATE POLICY "transactions_insert_admin" ON public.transactions FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "transactions_update_admin" ON public.transactions;
CREATE POLICY "transactions_update_admin" ON public.transactions FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "transactions_delete_admin" ON public.transactions;
CREATE POLICY "transactions_delete_admin" ON public.transactions FOR DELETE
  TO authenticated USING (public.is_admin());
