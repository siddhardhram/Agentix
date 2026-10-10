-- ==============================================================================
-- 002_role_requests.sql
-- Adds role request workflow columns to profiles table and updates signup trigger.
-- ==============================================================================

-- 1. Add role request tracking columns to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS requested_role TEXT DEFAULT 'user' CHECK (requested_role IN ('user', 'developer', 'admin')),
ADD COLUMN IF NOT EXISTS role_request_status TEXT DEFAULT 'none' CHECK (role_request_status IN ('none', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS role_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS role_reviewed_at TIMESTAMPTZ;

-- 2. Index on role_request_status for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role_request_status ON public.profiles(role_request_status);

-- 3. Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  req_role TEXT;
  initial_status TEXT;
BEGIN
  req_role := COALESCE(new.raw_user_meta_data->>'requested_role', new.raw_user_meta_data->>'role', 'user');
  
  IF req_role = 'developer' THEN
    initial_status := 'pending';
  ELSE
    initial_status := 'none';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    requested_role,
    role_request_status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'user', -- Always start active role as user
    req_role,
    initial_status
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    requested_role = COALESCE(EXCLUDED.requested_role, public.profiles.requested_role),
    role_request_status = COALESCE(EXCLUDED.role_request_status, public.profiles.role_request_status),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
