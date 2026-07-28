-- =====================================================================
-- 014: Row Level Security — defense in depth.
--
-- Architecture note: the browser never talks to Supabase directly. Every
-- request goes through the Express API, which uses the service_role key
-- (supabaseAdmin) and therefore BYPASSES RLS entirely. Access control is
-- enforced in Express via JWT + role middleware (see server/src/middlewares/auth.js).
--
-- RLS here exists purely so that IF the anon/public key were ever exposed
-- client-side by mistake, it grants zero access by default rather than
-- silently allowing reads. We enable RLS on every table and add no
-- permissive policies — anon and authenticated roles get nothing.
-- =====================================================================

do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;
