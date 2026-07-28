-- =====================================================================
-- 003: Academic structure — classes, subjects, courses, batches, teachers
-- Classes are data-driven (not hardcoded) so adding "Class 1", "Class 2"...
-- later is an insert, not a schema change.
-- =====================================================================

create table classes (
  id serial primary key,
  name text not null unique,             -- Nursery, LKG, UKG, Class 1, ...
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table subjects (
  id serial primary key,
  name text not null,                    -- Physics, Mathematics, Chemistry, English, Biology
  class_id int references classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(name, class_id)
);

create table courses (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text,
  class_id int references classes(id) on delete set null,
  duration text,                         -- e.g. "1 Year", "6 Months"
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_courses_updated_at before update on courses
  for each row execute function set_updated_at();

create table teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete set null,
  full_name text not null,
  designation text,                      -- e.g. "Director", "Senior Faculty"
  bio text,
  qualification text,
  experience_years int,
  photo_url text,
  is_director boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_teachers_updated_at before update on teachers
  for each row execute function set_updated_at();

create table teacher_subjects (
  teacher_id uuid not null references teachers(id) on delete cascade,
  subject_id int not null references subjects(id) on delete cascade,
  primary key (teacher_id, subject_id)
);

create table batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- e.g. "Nursery - Morning A"
  class_id int not null references classes(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete set null,
  capacity int,
  schedule_summary text,                 -- human-readable, detailed slots live in `timetable`
  academic_year text not null,           -- e.g. "2026-27"
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_batches_class on batches(class_id);

create table timetable (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  subject_id int references subjects(id) on delete set null,
  teacher_id uuid references teachers(id) on delete set null,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);
create index idx_timetable_batch on timetable(batch_id);
