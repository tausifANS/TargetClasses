-- =====================================================================
-- 008: Results (report-card style, not just online exams) & Toppers
-- =====================================================================

create table results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  exam_id uuid references exams(id) on delete set null,   -- null if manually entered (offline test)
  class_id int not null references classes(id),
  subject_id int references subjects(id),
  term text not null,                    -- e.g. "Term 1 2026-27"
  marks_obtained numeric not null,
  max_marks numeric not null,
  grade text,
  remarks text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_results_student on results(student_id);

create table toppers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  name text not null,                    -- denormalized so a topper card survives student deletion
  photo_url text,
  class_id int references classes(id),
  exam_name text,
  marks_obtained numeric,
  max_marks numeric,
  percentage numeric,
  rank int,
  quote text,
  academic_year text not null,
  is_featured boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_toppers_year on toppers(academic_year);
