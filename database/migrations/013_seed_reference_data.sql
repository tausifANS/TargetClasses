-- =====================================================================
-- 013: Seed reference/lookup data (no secrets — safe to run as-is)
-- Teachers, the admin user, and anything needing a password hash are
-- seeded separately via `server/scripts/seed.js` (keeps bcrypt hashing in
-- one place instead of duplicating it in SQL).
-- =====================================================================

insert into roles (name, description) values
  ('super_admin', 'Full system access'),
  ('admin', 'Institute administrator'),
  ('teacher', 'Faculty member'),
  ('student', 'Enrolled student')
on conflict (name) do nothing;

insert into classes (name, display_order) values
  ('Nursery', 1),
  ('LKG', 2),
  ('UKG', 3)
on conflict (name) do nothing;
-- Future classes (Class 1, Class 2, ...) are added the same way — a single
-- insert here, no code change required anywhere else in the system.

insert into subjects (name, class_id) values
  ('Physics', null),
  ('Mathematics', null),
  ('Chemistry', null),
  ('English', null),
  ('Biology', null);
-- class_id left null = taught across classes generally; narrow to a specific
-- class_id later once subjects are only offered from e.g. Class 6 onward.

insert into gallery_categories (name, slug, display_order) values
  ('Photos', 'photos', 1),
  ('Videos', 'videos', 2),
  ('Annual Function', 'annual-function', 3),
  ('Classroom', 'classroom', 4),
  ('Events', 'events', 5),
  ('Topper', 'topper', 6),
  ('Infrastructure', 'infrastructure', 7)
on conflict (name) do nothing;

insert into faqs (question, answer, category, order_index) values
  ('What classes does Target Classes currently offer?', 'We currently offer Nursery, LKG, and UKG, with more classes being added as we grow.', 'Admissions', 1),
  ('How do I apply for admission?', 'Fill out the Admission form on our website. Our team reviews every application and you will be notified by email once a decision is made.', 'Admissions', 2),
  ('What documents are required for admission?', 'A recent photograph, birth certificate, and (optionally) Aadhaar card. Additional documents can be uploaded from the admission form.', 'Admissions', 3),
  ('How will I know if my child is admitted?', 'Once approved, you will receive an email with the Student ID and a link to the Student Portal along with login instructions.', 'Admissions', 4)
on conflict do nothing;
