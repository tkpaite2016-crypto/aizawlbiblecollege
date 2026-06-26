-- Update is_admin function to include finance role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role IN ('admin', 'finance')
);
$$;

-- Update is_faculty_or_admin function to include finance role
CREATE OR REPLACE FUNCTION is_faculty_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role IN ('admin', 'faculty', 'finance')
);
$$;

-- Drop and recreate transactions policies to support finance role
DROP POLICY IF EXISTS transactions_insert_authenticated ON transactions;
DROP POLICY IF EXISTS transactions_delete_admin ON transactions;

CREATE POLICY transactions_insert_admin_finance ON transactions
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR is_faculty_or_admin());

CREATE POLICY transactions_delete_admin_finance ON transactions
  FOR DELETE TO authenticated
  USING (is_faculty_or_admin());

-- Update payment_requests policies to include finance role
DROP POLICY IF EXISTS admin_insert_requests ON payment_requests;
DROP POLICY IF EXISTS admin_update_requests ON payment_requests;
DROP POLICY IF EXISTS admin_delete_requests ON payment_requests;
DROP POLICY IF EXISTS admin_view_all_requests ON payment_requests;

CREATE POLICY admin_finance_insert_requests ON payment_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty', 'finance')
    )
  );

CREATE POLICY admin_finance_update_requests ON payment_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty', 'finance')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty', 'finance')
    )
  );

CREATE POLICY admin_finance_delete_requests ON payment_requests
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty', 'finance')
    )
  );

CREATE POLICY admin_finance_view_all_requests ON payment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty', 'finance')
    )
  );