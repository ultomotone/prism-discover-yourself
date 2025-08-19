-- Add public read access for profiles table (for dashboard statistics)
-- Keep existing policies for user data protection, but add public read for analytics

CREATE POLICY "Public can view profiles for dashboard statistics" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Also ensure the profiles table has proper indexing for dashboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_overlay ON profiles(overlay);
CREATE INDEX IF NOT EXISTS idx_profiles_type_code ON profiles(type_code);