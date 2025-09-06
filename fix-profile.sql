-- Run this SQL in your Supabase dashboard to fix the profile issue
-- This will create a profile for any existing users who don't have one

INSERT INTO public.profiles (id, email, full_name)
SELECT 
  auth.users.id,
  auth.users.email,
  COALESCE(
    auth.users.raw_user_meta_data->>'full_name', 
    split_part(auth.users.email, '@', 1),
    'User'
  ) as full_name
FROM auth.users
WHERE auth.users.id NOT IN (
  SELECT id FROM public.profiles
)
ON CONFLICT (id) DO NOTHING;