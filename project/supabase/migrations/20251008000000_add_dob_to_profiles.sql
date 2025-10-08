-- Add date of birth column to profiles table
ALTER TABLE profiles ADD dob date;

-- Force schema refresh by updating the table
COMMENT ON TABLE profiles IS 'User profile information including DOB';
