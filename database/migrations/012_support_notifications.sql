-- =====================================================================
-- 012: Contact queries, support tickets, notifications
-- =====================================================================

create table contact_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','responded')),
  responded_by uuid references users(id),
  response text,
  created_at timestamptz not null default now()
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','pending','resolved')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_tickets_updated_at before update on support_tickets
  for each row execute function set_updated_at();
create index idx_tickets_student on support_tickets(student_id);

create table ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid references users(id),
  message text not null,
  created_at timestamptz not null default now()
);
create index idx_ticket_replies_ticket on ticket_replies(ticket_id);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,  -- null = broadcast to all
  title text not null,
  message text,
  type text default 'info',              -- info | success | warning | alert
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id);
