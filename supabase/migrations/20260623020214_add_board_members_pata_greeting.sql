-- Board of Management table
CREATE TABLE IF NOT EXISTS public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text,
  photo_url text,
  display_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "board_members_select" ON public.board_members FOR SELECT TO public USING (true);
CREATE POLICY "board_members_insert_admin" ON public.board_members FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "board_members_update_admin" ON public.board_members FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "board_members_delete_admin" ON public.board_members FOR DELETE TO authenticated USING (public.is_admin());

-- PATA registration number per student
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pata_reg_no text;

-- Fix profiles update policy: ensure users can always update their own profile
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Principal greeting settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('principal_greeting_enabled', 'true', 'text', 'Show principal greeting modal to first-time visitors (true/false)'),
  ('principal_greeting_name', 'Rev. Dr. C.S. Muanga', 'text', 'Principal full name for greeting modal'),
  ('principal_greeting_title', 'Principal, Aizawl Bible College', 'text', 'Principal title for greeting modal')
ON CONFLICT (setting_key) DO NOTHING;