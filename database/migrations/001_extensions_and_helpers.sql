-- =====================================================================
-- 001: Extensions and shared helpers
-- Run this first in Supabase SQL Editor (Project > SQL Editor > New query)
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive email/text

-- Generic "touch updated_at" trigger function, reused by every table below
-- that has an updated_at column.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
