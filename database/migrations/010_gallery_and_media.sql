-- =====================================================================
-- 010: Gallery & media library
-- =====================================================================

create table gallery_categories (
  id serial primary key,
  name text not null unique,             -- Photos, Videos, Annual Function, Classroom, Events, Topper, Infrastructure
  slug text not null unique,
  display_order int not null default 0
);

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  category_id int not null references gallery_categories(id) on delete cascade,
  media_type text not null default 'photo' check (media_type in ('photo','video')),
  file_url text not null,
  thumbnail_url text,
  title text,
  caption text,
  width int,
  height int,
  is_featured boolean not null default false,
  display_order int not null default 0,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_gallery_items_category on gallery_items(category_id);
