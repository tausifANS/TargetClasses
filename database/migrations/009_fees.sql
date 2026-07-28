-- =====================================================================
-- 009: Fees — structure + payment ledger.
-- Note: fee amounts are intentionally never exposed on the public site;
-- these tables back the Admin Dashboard and each student's own portal only.
-- =====================================================================

create table fee_structures (
  id uuid primary key default gen_random_uuid(),
  class_id int not null references classes(id),
  course_id int references courses(id),
  academic_year text not null,
  total_amount numeric not null,
  installments jsonb default '[]'::jsonb,  -- [{label, amount, due_date}]
  created_at timestamptz not null default now(),
  unique(class_id, course_id, academic_year)
);

create table fee_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id),
  amount numeric not null,
  payment_date date not null default current_date,
  mode text check (mode in ('cash','upi','card','bank_transfer','cheque','other')),
  transaction_ref text,
  status text not null default 'paid' check (status in ('paid','pending','failed','refunded')),
  receipt_url text,
  recorded_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index idx_fee_payments_student on fee_payments(student_id);
