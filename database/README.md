# Database — Supabase Postgres

We're using the Supabase-hosted Postgres **without** a direct DB connection string (per your choice), so migrations run through the **Supabase SQL Editor**, not a CLI/Prisma migration tool.

## How to apply

1. Open your project at https://supabase.com/dashboard/project/kvbczdxdsktfkphzxdhs
2. Go to **SQL Editor → New query**
3. Paste and run each file in `migrations/` **in numeric order** (001 → 014). Run them one at a time and confirm each succeeds before moving to the next — several later files depend on tables created earlier.
4. After all 14 run cleanly, come back here and I'll run `server/scripts/seed.js`, which inserts the teachers, the admin login, and organizes gallery entries (it needs `SUPABASE_SERVICE_ROLE_KEY`, already in `server/.env`).

## What's in each file

| File | Contents |
|---|---|
| 001 | Extensions (`pgcrypto`, `citext`) + shared `updated_at` trigger |
| 002 | `roles`, `permissions`, `role_permissions`, `users`, `auth_tokens`, `audit_logs` |
| 003 | `classes`, `subjects`, `courses`, `teachers`, `teacher_subjects`, `batches`, `timetable` |
| 004 | `admissions`, `students` |
| 005 | `attendance` |
| 006 | `assignments`, `assignment_submissions`, `study_materials` |
| 007 | `exams`, `questions`, `exam_attempts` |
| 008 | `results`, `toppers` |
| 009 | `fee_structures`, `fee_payments` |
| 010 | `gallery_categories`, `gallery_items` |
| 011 | `testimonials`, `notices`, `events`, `blogs`, `faqs` |
| 012 | `contact_queries`, `support_tickets`, `ticket_replies`, `notifications` |
| 013 | Seed data: roles, classes (Nursery/LKG/UKG), subjects, gallery categories, FAQs |
| 014 | Row Level Security enabled on every table (deny-by-default; the API uses the service_role key which bypasses RLS — see comments in the file) |

## Why not Prisma / a direct connection?

Prisma migrations need the raw Postgres connection string + password. You opted to skip that and go through Supabase directly instead, so the backend talks to Postgres exclusively via `@supabase/supabase-js` (`server/src/config/supabase.js`), and schema changes are plain SQL files applied by hand in the SQL Editor. If you'd rather switch to Prisma later, share the connection string and I'll convert these files into a Prisma schema + migration history — no data model changes needed, just tooling.
