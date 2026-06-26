import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'faculty' | 'student' | 'standard' | 'finance';
  student_year: '1st_year' | '2nd_year' | 'final_year' | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  course: string | null;
  completion_date: string | null;
  certificate_url: string | null;
  graduated: boolean;
  admission_date: string | null;
  qualification: string | null;
  subject_in_charge: string | null;
  pata_reg_no: string | null;
  position: string | null;
  is_banned: boolean;
  profile_theme: string | null;
};

export type Notification = {
  id: string;
  user_id: string;
  sent_by: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'event' | 'general' | 'urgent' | 'financial';
  priority: 'high' | 'medium' | 'low';
  author_id: string | null;
  is_published: boolean;
  expires_at: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Teacher = {
  id: string;
  full_name: string;
  qualification: string | null;
  address: string | null;
  subject_in_charge: string | null;
  photo_url: string | null;
  is_current: boolean;
  display_order: number;
  joined_at: string | null;
  left_at: string | null;
  bio: string | null;
  created_at: string;
};

export type Download = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  category: 'academic_calendar' | 'syllabus' | 'application_form' | 'result' | 'general' | 'policy';
  semester: string | null;
  file_size_kb: number | null;
  uploaded_by: string | null;
  is_active: boolean;
  created_at: string;
};

export type Photo = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  album: string | null;
  uploaded_by: string | null;
  is_published: boolean;
  created_at: string;
};

export type ForumPost = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type ForumReply = {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Application = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  applying_for: string | null;
  previous_education: string | null;
  church_name: string | null;
  pastor_name: string | null;
  statement: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  // Extended fields
  course_applied: 'BTh' | 'DipTh' | 'CTh' | null;
  pin_code: string | null;
  guardian_name: string | null;
  parent_occupation: string | null;
  annual_income: string | null;
  mother_tongue: string | null;
  other_languages: string | null;
  marital_status: 'single' | 'married' | null;
  academic_qualifications: { class_name: string; school_college: string; pass_fail: string; year: string }[];
  born_again: string | null;
  water_baptism_date: string | null;
  denomination: string | null;
  church_involvement: string | null;
  statement_of_purpose: string | null;
  calling_aim: string | null;
  practices_vices: boolean | null;
  can_pay_fees: boolean | null;
  fee_sponsor: 'self' | 'guardian' | 'church' | null;
  passport_photo_url: string | null;
  signature_data_url: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  submitted_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  season: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'online' | 'cheque';
  payment_type: 'fee' | 'mess' | 'other';
  status: 'pending' | 'completed' | 'failed';
  receipt_number: string | null;
  reference_no: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  user?: Profile;
  gateway?: string | null;
  gateway_order_id?: string | null;
  gateway_payment_id?: string | null;
  gateway_signature?: string | null;
};

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'image' | 'text' | 'json';
  description: string | null;
  created_at: string;
  updated_at: string;
};
