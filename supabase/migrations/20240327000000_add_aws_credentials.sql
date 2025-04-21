-- Add AWS credentials columns to profiles table
ALTER TABLE profiles
ADD COLUMN aws_access_key_id TEXT,
ADD COLUMN aws_secret_access_key TEXT,
ADD COLUMN aws_region TEXT; 