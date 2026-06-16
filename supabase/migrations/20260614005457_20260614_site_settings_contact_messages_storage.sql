/*
# Site settings, contact messages, and storage

1. site_settings table — stores configurable site images/content
   - SELECT policy allows BOTH anon and authenticated (fixes hero images for logged-out visitors)
   - INSERT/UPDATE restricted to admin

2. contact_messages table — stores contact form submissions
   - Anyone (anon + authenticated) can INSERT
   - Only admins can SELECT/UPDATE/DELETE

3. Storage buckets
   - photos (public) — gallery, teacher photos
   - site-images (public) — admin site settings images
   - Appropriate RLS policies on storage.objects for each bucket
*/

-- ============================
-- TABLE: site_settings
-- ============================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('home_hero_image', 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=1600', 'image', 'Home page hero background image'),
  ('home_about_image', 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', 'Home page about section image'),
  ('about_hero_image', 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1600', 'image', 'About page hero background image'),
  ('about_image_1', 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=600', 'image', 'About page image 1 - College campus'),
  ('about_image_2', 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=600', 'image', 'About page image 2 - Students studying'),
  ('about_image_3', 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=600', 'image', 'About page image 3 - Chapel'),
  ('about_image_4', 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600', 'image', 'About page image 4 - Library')
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_site_settings_public" ON public.site_settings;
CREATE POLICY "select_site_settings_public" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_site_settings_admin" ON public.site_settings;
CREATE POLICY "insert_site_settings_admin" ON public.site_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_site_settings_admin" ON public.site_settings;
CREATE POLICY "update_site_settings_admin" ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings (setting_key);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- TABLE: contact_messages
-- ============================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(is_read, submitted_at DESC);

DROP POLICY IF EXISTS "contact_messages_insert_public" ON public.contact_messages;
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_select_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_select_admin" ON public.contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_update_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_update_admin" ON public.contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_delete_admin" ON public.contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================
-- STORAGE: buckets + policies
-- ============================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('photos', 'photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('site-images', 'site-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- Photos bucket policies
DROP POLICY IF EXISTS "photos_storage_public_read" ON storage.objects;
CREATE POLICY "photos_storage_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_storage_upload_faculty_admin" ON storage.objects;
CREATE POLICY "photos_storage_upload_faculty_admin" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'photos' AND public.is_faculty_or_admin());

DROP POLICY IF EXISTS "photos_storage_update_admin" ON storage.objects;
CREATE POLICY "photos_storage_update_admin" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'photos' AND public.is_admin());

DROP POLICY IF EXISTS "photos_storage_delete_admin" ON storage.objects;
CREATE POLICY "photos_storage_delete_admin" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'photos' AND public.is_admin());

-- Site-images bucket policies
DROP POLICY IF EXISTS "site_images_storage_public_read" ON storage.objects;
CREATE POLICY "site_images_storage_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_storage_upload_admin" ON storage.objects;
CREATE POLICY "site_images_storage_upload_admin" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

DROP POLICY IF EXISTS "site_images_storage_update_admin" ON storage.objects;
CREATE POLICY "site_images_storage_update_admin" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

DROP POLICY IF EXISTS "site_images_storage_delete_admin" ON storage.objects;
CREATE POLICY "site_images_storage_delete_admin" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'site-images' AND public.is_admin());
