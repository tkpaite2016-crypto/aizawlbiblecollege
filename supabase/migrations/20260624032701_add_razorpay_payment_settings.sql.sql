-- Add Razorpay payment settings to site_settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('razorpay_enabled', 'false', 'boolean', 'Enable Razorpay payments'),
  ('razorpay_key_id', '', 'string', 'Razorpay Key ID'),
  ('razorpay_key_secret', '', 'string', 'Razorpay Key Secret (keep secure)'),
  ('razorpay_webhook_secret', '', 'string', 'Razorpay Webhook Secret')
ON CONFLICT (setting_key) DO NOTHING;

-- Add payment gateway fields to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gateway VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(100);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(100);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gateway_signature TEXT;
