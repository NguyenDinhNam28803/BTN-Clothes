-- Create a new table for store settings
CREATE TABLE IF NOT EXISTS "settings" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key" text NOT NULL UNIQUE,
  "value" jsonb NOT NULL,
  "category" text NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_updated_at();

-- Add some initial settings data
INSERT INTO "settings" ("key", "value", "category") VALUES
-- General Information
('company_info', json_build_object(
  'name', 'BTN Clothes',
  'slogan', 'Fashion For Everyone',
  'description', 'BTN Clothes là thương hiệu thời trang hàng đầu với các sản phẩm chất lượng cao, thiết kế hiện đại và giá cả hợp lý.',
  'logo_url', '',
  'tax_id', '0123456789',
  'business_license', 'BL-0123456789'
), 'general'),

-- Contact Information
('contact_info', json_build_object(
  'hotline', '0123-456-789',
  'primary_email', 'info@btnclothes.com',
  'sales_email', 'sales@btnclothes.com',
  'support_email', 'support@btnclothes.com',
  'address', '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
  'working_hours_weekday', '8:00 - 20:30',
  'working_hours_weekend', '9:00 - 21:00'
), 'contact'),

-- Social Media
('social_media', json_build_object(
  'facebook', 'https://facebook.com/btnclothes',
  'twitter', 'https://twitter.com/btnclothes',
  'instagram', 'https://instagram.com/btnclothes',
  'linkedin', 'https://linkedin.com/company/btnclothes'
), 'social'),

-- Appearance
('appearance', json_build_object(
  'primary_color', '#3B82F6',
  'secondary_color', '#10B981'
), 'appearance'),

-- Notifications
('notifications', json_build_object(
  'enable_notifications', true,
  'enable_email_alerts', true,
  'enable_sms', false
), 'notifications');

-- Add RLS Policies
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select settings
CREATE POLICY "Allow authenticated users to view settings"
ON "settings"
FOR SELECT
TO authenticated
USING (true);

-- Allow only administrators to manage settings
CREATE POLICY "Allow administrators to manage settings"
ON "settings"
FOR ALL
TO authenticated
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Make sure there is an is_admin column in profiles
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false;

-- Update default admin user (you may need to replace this with the actual admin user ID)
UPDATE "profiles" SET "is_admin" = true 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@btnclothes.com');