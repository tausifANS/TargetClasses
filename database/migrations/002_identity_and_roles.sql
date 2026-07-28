-- =====================================================================
-- 002: Identity, roles & permissions
-- Custom JWT auth (not Supabase Auth) — this table IS our user directory.
-- =====================================================================

create table roles (
  id serial primary key,
  name text not null unique,            -- super_admin | admin | teacher | student
  description text
);

create table permissions (
  id serial primary key,
  code text not null unique,             -- e.g. 'admissions.approve', 'exams.create'
  description text
);

create table role_permissions (
  role_id int not null references roles(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique,                        -- nullable: students may log in via student_code instead
  phone text,
  password_hash text not null,
  role_id int not null references roles(id),
  must_change_password boolean not null default false, -- forced on first login (temp password flow)
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

create index idx_users_role on users(role_id);

create table auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,                    -- sha256 of the raw token; never store raw tokens
  type text not null check (type in ('password_reset','first_login_setup','email_verify')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_auth_tokens_user on auth_tokens(user_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  action text not null,                        -- e.g. 'admission.approve'
  entity_type text not null,                   -- e.g. 'admission'
  entity_id text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_actor on audit_logs(actor_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
