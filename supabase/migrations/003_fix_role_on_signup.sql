-- ==============================================================================
-- 003_fix_role_on_signup.sql
-- CRITICAL FIX: The previous trigger always set role='user' regardless of
-- what the user selected during signup. This migration fixes the trigger to:
--   - Set role = user directly (no pending) when requested_role = 'user'
--   - Set role = admin directly (no pending) when requested_role = 'admin'
--   - Set role = user + requested_role = developer + status = pending when requested_role = 'developer'
-- This also fixes the ON CONFLICT clause to properly update the role column
-- for cases where the upsert is called after the trigger already created the row.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  req_role TEXT;
  initial_role TEXT;
  initial_status TEXT;
BEGIN
  -- Derive requested role from user_metadata (set during signUp options.data)
  req_role := COALESCE(
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'requested_role',
    'user'
  );

  -- Validate: only accept known roles, default to 'user'
  IF req_role NOT IN ('user', 'developer', 'admin') THEN
    req_role := 'user';
  END IF;

  -- Developers go through an approval process — active role stays 'user' until approved
  IF req_role = 'developer' THEN
    initial_role   := 'user';
    initial_status := 'pending';
  ELSE
    -- 'user' and 'admin' registrations are immediately active
    initial_role   := req_role;
    initial_status := 'approved';
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
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    initial_role,
    req_role,
    initial_status
  )
  ON CONFLICT (id) DO UPDATE SET
    email              = EXCLUDED.email,
    full_name          = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url         = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    -- Only update role if the existing row still has the default 'user' AND
    -- the new signup specifies a non-developer role (i.e. 'admin').
    -- For developers the role stays 'user' until admin approval.
    role               = CASE
                           WHEN public.profiles.role = 'user' AND EXCLUDED.role != 'user'
                           THEN EXCLUDED.role
                           ELSE public.profiles.role
                         END,
    requested_role     = COALESCE(EXCLUDED.requested_role, public.profiles.requested_role),
    role_request_status = COALESCE(EXCLUDED.role_request_status, public.profiles.role_request_status),
    updated_at         = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also add a policy to allow the trigger / service role to update profiles.
-- The update policy currently only allows the user themselves or admins.
-- We add a service-role bypass (SECURITY DEFINER function already handles it).

-- Grant the function correct permissions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
