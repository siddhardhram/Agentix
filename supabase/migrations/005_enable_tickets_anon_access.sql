-- ==============================================================================
-- 005_enable_tickets_anon_access.sql
-- Grants public/anon access to tickets & login_history tables so Clerk-authenticated
-- frontend sessions can read/write tickets directly to PostgreSQL.
-- ==============================================================================

-- Drop existing restrictive policies on tickets
DROP POLICY IF EXISTS "Tickets select policy" ON public.tickets;
DROP POLICY IF EXISTS "Tickets insert policy" ON public.tickets;
DROP POLICY IF EXISTS "Tickets update policy" ON public.tickets;

-- Create open policies for Clerk sessions
CREATE POLICY "Tickets select policy"
  ON public.tickets FOR SELECT
  USING (true);

CREATE POLICY "Tickets insert policy"
  ON public.tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tickets update policy"
  ON public.tickets FOR UPDATE
  USING (true);

-- Ensure profiles is accessible
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (true);
