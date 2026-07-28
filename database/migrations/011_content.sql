-- =====================================================================
-- 011: Public-site content — testimonials, notices, events, blogs, FAQs
-- =====================================================================

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text check (author_role in ('student','parent','alumni')),
  photo_url text,
  message text not null,
  rating smallint check (rating between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text,
  is_pinned boolean not null default false,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_notices_published on notices(published_at desc);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  banner_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_events_date on events(event_date);

create table blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image_url text,
  author_id uuid references users(id),
  tags text[] default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_blogs_updated_at before update on blogs
  for each row execute function set_updated_at();

create table faqs (
  id serial primary key,
  question text not null,
  answer text not null,
  category text,
  order_index int not null default 0,
  is_active boolean not null default true
);
