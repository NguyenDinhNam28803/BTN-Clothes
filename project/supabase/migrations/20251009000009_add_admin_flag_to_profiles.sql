-- Add is_admin column to profiles table for admin access control
ALTER TABLE profiles ADD is_admin BOOLEAN DEFAULT false;

-- Set a default admin user (you may want to replace this UUID with a real user)
UPDATE profiles SET is_admin = true WHERE id = '00000000-0000-0000-0000-000000000000';