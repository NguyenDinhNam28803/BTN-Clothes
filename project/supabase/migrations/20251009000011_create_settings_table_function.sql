-- Function to create settings table if it doesn't exist
-- This can be called from the application to ensure the table exists
CREATE OR REPLACE FUNCTION create_settings_table_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'settings'
  ) THEN
    RETURN true;
  END IF;

  -- Create the settings table
  CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" text NOT NULL UNIQUE,
    "value" jsonb NOT NULL,
    "category" text NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now()
  );

  -- Create a trigger to automatically update the updated_at column
  CREATE OR REPLACE FUNCTION update_settings_updated_at()
  RETURNS TRIGGER AS $settings_trigger$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $settings_trigger$ LANGUAGE plpgsql;

  CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

  -- Add initial settings data
  INSERT INTO "settings" ("key", "value", "category") VALUES
  -- General Information
  ('company_info', jsonb_build_object(
    'name', 'BTN Clothes',
    'slogan', 'Fashion For Everyone',
    'description', 'BTN Clothes là thương hiệu thời trang hàng đầu với các sản phẩm chất lượng cao, thiết kế hiện đại và giá cả hợp lý.',
    'logo_url', '',
    'tax_id', '0123456789',
    'business_license', 'BL-0123456789'
  ), 'general'),

  -- Contact Information
  ('contact_info', jsonb_build_object(
    'hotline', '0123-456-789',
    'primary_email', 'info@btnclothes.com',
    'sales_email', 'sales@btnclothes.com',
    'support_email', 'support@btnclothes.com',
    'address', '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
    'working_hours_weekday', '8:00 - 20:30',
    'working_hours_weekend', '9:00 - 21:00'
  ), 'contact'),

  -- Social Media
  ('social_media', jsonb_build_object(
    'facebook', 'https://facebook.com/btnclothes',
    'twitter', 'https://twitter.com/btnclothes',
    'instagram', 'https://instagram.com/btnclothes',
    'linkedin', 'https://linkedin.com/company/btnclothes'
  ), 'social'),

  -- Appearance
  ('appearance', jsonb_build_object(
    'primary_color', '#3B82F6',
    'secondary_color', '#10B981'
  ), 'appearance'),

  -- Notifications
  ('notifications', jsonb_build_object(
    'enable_notifications', true,
    'enable_email_alerts', true,
    'enable_sms', false,
    'maintenance_mode', false
  ), 'notifications');

  -- Allow authenticated users to select settings
  ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

  -- Add RLS policies
  CREATE POLICY "Allow authenticated users to view settings"
  ON "settings"
  FOR SELECT
  TO authenticated
  USING (true);

  -- Allow authenticated users to update settings (we'll restrict this further later)
  CREATE POLICY "Allow authenticated users to update settings"
  ON "settings"
  FOR UPDATE
  TO authenticated
  USING (true);

  -- Allow authenticated users to insert settings (we'll restrict this further later)
  CREATE POLICY "Allow authenticated users to insert settings"
  ON "settings"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating settings table: %', SQLERRM;
    RETURN false;
END;
$$;