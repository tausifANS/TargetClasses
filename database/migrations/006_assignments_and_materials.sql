-- =====================================================================
-- 006: Assignments, submissions & study materials (notes/PDFs/videos)
-- =====================================================================

create table assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id int not null references classes(id),
  batch_id uuid references batches(id),
  subject_id int references subjects(id),
  teacher_id uuid references teachers(id),
  file_url text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_assignments_updated_at before update on assignments
  for each row execute function set_updated_at();
create index idx_assignments_class on assignments(class_id);

create table assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  file_url text not null,
  submitted_at timestamptz not null default now(),
  grade text,
  feedback text,
  unique(assignment_id, student_id)
);

create table study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id int not null references classes(id),
  subject_id int references subjects(id),
  material_type text not null check (material_type in ('pdf','video','note','other')),
  file_url text not null,
  thumbnail_url text,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_materials_class on study_materials(class_id);
