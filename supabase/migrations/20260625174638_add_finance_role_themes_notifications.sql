
-- Add finance to profile role enum
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'faculty', 'student', 'standard', 'finance'));

-- Add profile_theme column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_theme text DEFAULT 'classic';

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_by uuid REFERENCES profiles(id),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "read_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Finance, admin, faculty can insert notifications
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'faculty', 'finance')
    )
  );

-- Admins/finance can update (mark as read on behalf)
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Admins can delete
CREATE POLICY "delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
