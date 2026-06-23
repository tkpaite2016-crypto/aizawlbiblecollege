-- Add certificate-related fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS course text,
  ADD COLUMN IF NOT EXISTS completion_date date,
  ADD COLUMN IF NOT EXISTS certificate_url text,
  ADD COLUMN IF NOT EXISTS graduated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admission_date date;

-- Create certificates storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for certificates bucket
CREATE POLICY "certificates_select_public" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'certificates');

CREATE POLICY "certificates_insert_admin" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "certificates_update_admin" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'certificates' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "certificates_delete_admin" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'certificates' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update RLS policy for profiles to allow graduates to see their certificate
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT
  TO anon, authenticated USING (true);