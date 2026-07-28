import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COURSES } from '@/data/courses';

export function CoursesPage() {
  return (
    <>
      <title>Courses | Target Classes</title>
      <meta name="description" content="Explore Target Classes' Nursery, LKG, and UKG programs — built for how young children actually learn." />
      <PageHero
        eyebrow="Our Programs"
        title="Courses We Offer"
        description="From a child's very first classroom to a confident start in Class 1 — every program is built to match how young minds grow."
      />

      <section className="section-container py-24">
        <div className="flex flex-col gap-8">
          {COURSES.map((course, i) => (
            <motion.div
              key={course.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/80">
                  What Your Child Will Learn
                </h3>
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
          ))}
        </div>
      </section>
    </>
  );
}
