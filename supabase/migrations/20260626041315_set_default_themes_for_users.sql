-- Update handle_new_user trigger to set default themes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role text := 'standard';
  assigned_theme text := 'classic';
BEGIN
  -- Assign role based on email
  IF NEW.email = 'tkpaite2016@gmail.com' THEN
    assigned_role := 'admin';
    assigned_theme := 'aurora'; -- Designer theme
  ELSIF NEW.email = 'csmuanga7@gmail.com' THEN
    assigned_role := 'faculty';
    assigned_theme := 'royal-gold'; -- Principal theme
  END IF;

  -- Insert profile with appropriate defaults
  INSERT INTO public.profiles (id, email, full_name, role, profile_theme)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    assigned_theme
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with default themes based on rules
-- Designer (tkpaite2016@gmail.com) - Aurora theme
UPDATE profiles SET profile_theme = 'aurora' 
WHERE email = 'tkpaite2016@gmail.com' AND (profile_theme IS NULL OR profile_theme = 'classic');

-- Principal (csmuanga7@gmail.com) - Royal Gold theme  
UPDATE profiles SET profile_theme = 'royal-gold' 
WHERE email = 'csmuanga7@gmail.com' AND (profile_theme IS NULL OR profile_theme = 'classic');

-- Students with no theme set - Classic Navy
UPDATE profiles SET profile_theme = 'classic' 
WHERE role = 'student' AND profile_theme IS NULL;

-- Standard users with no theme set - Classic Navy
UPDATE profiles SET profile_theme = 'classic' 
WHERE role = 'standard' AND profile_theme IS NULL;

-- Faculty users with no theme set - Aurora theme
UPDATE profiles SET profile_theme = 'aurora' 
WHERE role = 'faculty' AND profile_theme IS NULL;