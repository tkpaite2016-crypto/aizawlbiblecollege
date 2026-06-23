ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS subject_in_charge text;
