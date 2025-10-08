-- Simple SQL file to add collected_at column to user_vouchers table
-- This can be run directly in the Supabase SQL editor

-- Add collected_at column if it doesn't exist
ALTER TABLE user_vouchers 
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;

-- Set existing records to use created_at date for collected_at
UPDATE user_vouchers 
SET collected_at = created_at 
WHERE collected_at IS NULL;

-- Set default for future insertions
ALTER TABLE user_vouchers 
ALTER COLUMN collected_at SET DEFAULT now();