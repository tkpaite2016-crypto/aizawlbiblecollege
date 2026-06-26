-- Add is_banned field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Create payment_requests table for admin to send payment requests to students
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES profiles(id),
  title text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL DEFAULT 'fee' CHECK (payment_type IN ('fee', 'mess', 'other')),
  due_date date,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own payment requests
CREATE POLICY "students_view_own_requests" ON payment_requests FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

-- Admin/faculty can view all payment requests
CREATE POLICY "admin_view_all_requests" ON payment_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  );

-- Admin can insert payment requests
CREATE POLICY "admin_insert_requests" ON payment_requests FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  );

-- Admin can update payment requests
CREATE POLICY "admin_update_requests" ON payment_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  );

-- Admin can delete payment requests
CREATE POLICY "admin_delete_requests" ON payment_requests FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  );

-- Students can update their own payment request status (to mark as paid)
CREATE POLICY "students_update_own_request_status" ON payment_requests FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
