-- Add payment_type and status columns to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'fee' CHECK (payment_type IN ('fee', 'mess', 'other')),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS receipt_number text;

-- Allow students to insert their own transactions
DROP POLICY IF EXISTS "transactions_insert_admin" ON public.transactions;
CREATE POLICY "transactions_insert_authenticated" ON public.transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Allow users to update their own pending transactions
DROP POLICY IF EXISTS "transactions_update_admin" ON public.transactions;
CREATE POLICY "transactions_update_owner" ON public.transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin()) 
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Generate receipt number function
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text AS $$
DECLARE
  year_part text := to_char(CURRENT_DATE, 'YYYY');
  month_part text := to_char(CURRENT_DATE, 'MM');
  seq_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 10 FOR 5) AS integer)), 0) + 1
  INTO seq_num
  FROM public.transactions
  WHERE receipt_number LIKE 'RCP-' || year_part || '-' || month_part || '-%';
  
  RETURN 'RCP-' || year_part || '-' || month_part || '-' || LPAD(seq_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing records to have receipt numbers
UPDATE public.transactions 
SET receipt_number = generate_receipt_number(), payment_type = 'fee'
WHERE receipt_number IS NULL;