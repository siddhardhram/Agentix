-- ==============================================================================
-- 004_fix_real_roles.sql
-- Sets the role directly from user metadata (developer, user, admin)
-- without forcing developers into a pending 'user' state.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  req_role TEXT;
BEGIN
  -- Derive requested role from raw_user_meta_data
  req_role := COALESCE(
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'requested_role',
    'user'
  );

  -- Validate: only accept known roles
  IF req_role NOT IN ('user', 'developer', 'admin') THEN
    req_role := 'user';
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
    req_role,
    req_role,
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    email               = EXCLUDED.email,
    full_name           = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url          = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    role                = COALESCE(EXCLUDED.role, public.profiles.role),
    requested_role      = COALESCE(EXCLUDED.requested_role, public.profiles.requested_role),
    role_request_status = 'approved',
    updated_at          = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles insert policy exists for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Profiles insert policy'
  ) THEN
    CREATE POLICY "Profiles insert policy"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
