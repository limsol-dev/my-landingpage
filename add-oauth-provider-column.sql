-- Add provider column to user_profiles table for OAuth provider tracking
-- This helps identify which social login provider was used

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider ON user_profiles(provider);

-- Update existing records to have 'email' as default provider
UPDATE user_profiles 
SET provider = 'email' 
WHERE provider IS NULL;

-- Add comment to the column
COMMENT ON COLUMN user_profiles.provider IS 'OAuth provider used for authentication (email, google, kakao, etc.)';

-- Example of updating specific user's provider (for existing OAuth users if needed)
-- UPDATE user_profiles SET provider = 'google' WHERE email = 'user@gmail.com';
-- UPDATE user_profiles SET provider = 'kakao' WHERE email = 'user@kakao.com'; 