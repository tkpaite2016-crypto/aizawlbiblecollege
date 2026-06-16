-- Grant all necessary permissions to anon and authenticated roles on all public tables.
-- This fixes the 42501 "permission denied for table" error that occurs when
-- Supabase's default role grants were not applied during migrations.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

GRANT SELECT ON public.notices TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notices TO authenticated;

GRANT SELECT ON public.teachers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teachers TO authenticated;

GRANT SELECT ON public.downloads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.downloads TO authenticated;

GRANT SELECT ON public.photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.photos TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;

GRANT SELECT, INSERT ON public.applications TO anon, authenticated;
GRANT UPDATE, DELETE ON public.applications TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- Ensure sequence access for generated UUIDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Set default privileges so future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
