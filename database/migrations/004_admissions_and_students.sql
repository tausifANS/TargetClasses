-- =====================================================================
-- 004: Admissions & students
-- Flow: public submits `admissions` (status=pending) -> admin approves ->
-- trigger-generated student_code/roll_number -> `students` row + `users`
-- login created -> congratulation email (handled in application code, since
-- Nodemailer runs in Node, not Postgres).
-- =====================================================================

create table admissions (
  id uuid primary key default gen_random_uuid(),
  application_no text not null unique,        -- e.g. TC-ADM-2026-000123

  -- Student personal details
  full_name text not null,
  dob date not null,
  gender text check (gender in ('male','female','other')),
  photo_url text,
  blood_group text,

  -- Academic
  class_applied_id int not null references classes(id),
  course_id int references courses(id),
  previous_school text,

  -- Parent / guardian details
  parent_name text not null,
  parent_phone text not null,
  parent_email citext,
  guardian_occupation text,

  -- Address
  address_line text not null,
  city text,
  state text,
  pincode text,

  -- Documents
  aadhaar_no text,                            -- optional, per brief
  birth_certificate_url text,
  document_urls jsonb default '[]'::jsonb,    -- array of {label, url}

  -- Emergency & medical
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_info text,

  -- Workflow
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_admissions_updated_at before update on admissions
  for each row execute function set_updated_at();
create index idx_admissions_status on admissions(status);

create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete set null,
  admission_id uuid unique references admissions(id) on delete set null,

  student_code text not null unique,          -- Student ID, e.g. TC2026001
  roll_number text,
  class_id int not null references classes(id),
  batch_id uuid references batches(id),

  full_name text not null,
  dob date,
  gender text,
  photo_url text,
  parent_name text,
  parent_phone text,
  parent_email citext,
  address_line text,

  admission_date date not null default current_date,
  status text not null default 'active' check (status in ('active','inactive','alumni')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_students_updated_at before update on students
  for each row execute function set_updated_at();
create index idx_students_class on students(class_id);
create index idx_students_batch on students(batch_id);
