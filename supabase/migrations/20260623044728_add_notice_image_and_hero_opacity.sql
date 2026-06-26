-- Add image_url to notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS image_url text;

-- Add hero opacity setting
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES ('home_hero_opacity', '0.88', 'text', 'Opacity of the hero background image overlay (0 = fully transparent, 1 = fully opaque)')
ON CONFLICT (setting_key) DO NOTHING;
