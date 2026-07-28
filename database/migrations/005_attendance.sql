-- =====================================================================
-- 005: Attendance
-- Teachers/admin mark attendance; students self-service punch in/out.
-- One row per student per day.
-- =====================================================================

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  date date not null,
  status text not null default 'present' check (status in ('present','absent','late','half_day')),
  punch_in_at timestamptz,
  punch_out_at timestamptz,
  marked_by uuid references users(id),        -- null when student self-punches
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, date)
);
create trigger trg_attendance_updated_at before update on attendance
  for each row execute function set_updated_at();
create index idx_attendance_student on attendance(student_id);
create index idx_attendance_date on attendance(date);
