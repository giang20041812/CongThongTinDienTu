-- Row Level Security on every table of the public schema, with no policy: Supabase's Data API (PostgREST and
-- GraphQL, roles anon/authenticated – anyone holding the project's anon key) can neither read nor change any row.
-- The site never uses that API: every query comes from the Node backend, connected as the owner of these tables
-- (role postgres, which also has BYPASSRLS on Supabase), and RLS does not apply to the owner. Data is reachable
-- only through /api and its own rules (security.ts).
--
-- Do not add policies for anon/authenticated unless the frontend starts calling Supabase directly. The backend must
-- keep connecting as the table owner (or a BYPASSRLS role), otherwise it would see empty tables.
-- On a plain PostgreSQL (local, Docker, VPS) the anon/authenticated roles do not exist: only RLS is switched on,
-- which changes nothing for the owner.

DO $$
DECLARE
  t regclass;
BEGIN
  FOR t IN
    SELECT c.oid::regclass FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);
  END LOOP;

  -- Supabase grants anon/authenticated everything (even TRUNCATE) on new public tables; RLS does not stop
  -- TRUNCATE, so the grants go too – also for tables created later by this role.
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
  END IF;
END $$;
