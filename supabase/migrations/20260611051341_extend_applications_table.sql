
-- Extend applications table with all fields matching the new online form

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS course_applied text CHECK (course_applied IN ('BTh', 'DipTh', 'CTh')),
  ADD COLUMN IF NOT EXISTS pin_code text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS parent_occupation text,
  ADD COLUMN IF NOT EXISTS annual_income text,
  ADD COLUMN IF NOT EXISTS mother_tongue text,
  ADD COLUMN IF NOT EXISTS other_languages text,
  ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('single', 'married')),
  ADD COLUMN IF NOT EXISTS academic_qualifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS born_again text,
  ADD COLUMN IF NOT EXISTS water_baptism_date text,
  ADD COLUMN IF NOT EXISTS denomination text,
  ADD COLUMN IF NOT EXISTS church_involvement text,
  ADD COLUMN IF NOT EXISTS statement_of_purpose text,
  ADD COLUMN IF NOT EXISTS calling_aim text,
  ADD COLUMN IF NOT EXISTS practices_vices boolean,
  ADD COLUMN IF NOT EXISTS can_pay_fees boolean,
  ADD COLUMN IF NOT EXISTS fee_sponsor text CHECK (fee_sponsor IN ('self', 'guardian', 'church')),
  ADD COLUMN IF NOT EXISTS passport_photo_url text,
  ADD COLUMN IF NOT EXISTS signature_data_url text;

COMMENT ON COLUMN public.applications.course_applied IS 'Program the applicant is applying for: BTh, DipTh, or CTh';
COMMENT ON COLUMN public.applications.academic_qualifications IS 'JSON array of {class_name, school_college, pass_fail, year}';
COMMENT ON COLUMN public.applications.passport_photo_url IS 'Base64 data URL or storage URL of passport photo';
COMMENT ON COLUMN public.applications.signature_data_url IS 'Base64 data URL from signature canvas';
