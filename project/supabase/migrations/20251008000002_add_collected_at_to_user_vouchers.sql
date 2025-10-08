-- Migration to add collected_at column to user_vouchers table
-- This migration adds the collected_at column which is needed by the frontend

-- Add collected_at column to user_vouchers table if it doesn't exist already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_attribute
        WHERE attrelid = 'user_vouchers'::regclass
        AND attname = 'collected_at'
        AND NOT attisdropped
    ) THEN
        ALTER TABLE user_vouchers ADD COLUMN collected_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Update existing rows to have a collected_at date (set to same as created_at)
UPDATE user_vouchers SET collected_at = created_at WHERE collected_at IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN user_vouchers.collected_at IS 'Timestamp when the user collected the voucher';