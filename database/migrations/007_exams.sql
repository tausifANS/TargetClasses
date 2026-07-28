-- =====================================================================
-- 007: Exam engine — MCQ + subjective, timed, auto-submit, ranking
-- =====================================================================

create table exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id int not null references classes(id),
  subject_id int references subjects(id),
  exam_type text not null default 'mcq' check (exam_type in ('mcq','subjective','mixed')),
  duration_minutes int not null default 60,
  total_marks numeric not null default 0,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_published boolean not null default false,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_exams_updated_at before update on exams
  for each row execute function set_updated_at();
create index idx_exams_class on exams(class_id);

create table questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'mcq' check (question_type in ('mcq','subjective')),
  options jsonb,                       -- [{key:'A', text:'...'}, ...] for MCQ
  correct_option text,                 -- key of correct option, MCQ only
  marks numeric not null default 1,
  order_index int not null default 0
);
create index idx_questions_exam on questions(exam_id);

create table exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  auto_submitted boolean not null default false,
  total_score numeric,
  rank int,
  answers jsonb default '{}'::jsonb,  -- { question_id: answer }
  unique(exam_id, student_id)
);
create index idx_exam_attempts_exam on exam_attempts(exam_id);
