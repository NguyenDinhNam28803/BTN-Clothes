-- Ensure dob column exists in profiles table
-- Using IF NOT EXISTS to prevent errors if column already exists
DO $$
BEGIN
    -- Check if column already exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dob'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN dob date;
    END IF;
END $$;

-- Force schema refresh by updating the table
COMMENT ON TABLE profiles IS 'User profile information including DOB';