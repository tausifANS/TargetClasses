import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COACHING_COURSES, EARLY_LEARNER_COURSES, type Course } from '@/data/courses';

function CourseCard({ course, index, learnLabel }: { course: Course; index: number; learnLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="grid gap-8 rounded-3xl border border-border bg-card p-8 sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:items-center"
    >
      <div>
        <Badge variant="gold">{course.ageGroup}</Badge>
        <h2 className="mt-4 font-display text-3xl font-bold">{course.name}</h2>
        <p className="mt-2 font-medium text-gold">{course.tagline}</p>
        <p className="mt-4 text-muted-foreground leading-relaxed">{course.description}</p>

        <div className="mt-6 flex flex-wrap gap-4">
          {course.highlights.map((h) => (
            <span key={h.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <h.icon className="size-4 text-gold" /> {h.label}
            </span>
          ))}
        </div>

        <Button asChild variant="gold" className="mt-7">
          <Link to="/admission">
            Apply for {course.name} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl bg-secondary/50 p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/80">{learnLabel}</h3>
        <ul className="mt-4 space-y-3">
          {course.focusAreas.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function CoursesPage() {
  return (
    <>
      <title>Courses | Target Classes</title>
      <meta
        name="description"
        content="Target Classes offers expert coaching for Class 9th–12th (Physics, Chemistry, Maths & Biology) plus a Nursery–UKG early learners program in Lar Town, Deoria."
      />
      <PageHero
        eyebrow="Our Programs"
        title="Courses We Offer"
        description="Focused coaching for Class 9th–12th, backed by faculty who know exactly what board exams demand — plus a nurturing early learners program for our youngest students."
      />

      <section className="section-container py-24">
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold">Primary Program</span>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Coaching for Class 9th–12th</h2>
        </div>
        <div className="flex flex-col gap-8">
          {COACHING_COURSES.map((course, i) => (
            <CourseCard key={course.slug} course={course} index={i} learnLabel="What Students Will Study" />
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="section-container">
          <div className="mb-12">
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">Also Offering</span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Early Learners Program (Nursery–UKG)</h2>
          </div>
          <div className="flex flex-col gap-8">
            {EARLY_LEARNER_COURSES.map((course, i) => (
              <CourseCard key={course.slug} course={course} index={i} learnLabel="What Your Child Will Learn" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
