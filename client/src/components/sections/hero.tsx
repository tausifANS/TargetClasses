import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/constants/site';

export function Hero() {
  return (
    <section className="dark relative flex min-h-[85vh] items-center overflow-hidden bg-background sm:min-h-[92vh]">
      <picture className="absolute inset-0 size-full">
        <source media="(max-width: 767px)" srcSet="/images/hero-phone-mobile.webp" />
        <img
          src="/images/hero-phone.webp"
          alt=""
          className="size-full object-cover object-center opacity-50"
          loading="eager"
          decoding="async"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />

      <div className="section-container relative z-10 pb-16 pt-28 sm:pb-24 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary sm:px-4 sm:text-sm">
            Established {SITE.established} &middot; Lar Town, Deoria
          </span>

          <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.12] text-foreground sm:mt-6 sm:text-5xl lg:text-6xl">
            Expert Coaching for <span className="text-primary">Class 9th–12th</span> That Hits Its Target
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            {SITE.name} prepares students for board exams with focused Physics, Chemistry, Maths &
            Biology coaching from experienced faculty — plus a nurturing Nursery–UKG program for our
            youngest learners.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button asChild size="lg" variant="gold" className="w-full sm:w-auto">
              <Link to="/admission">
                Start Admission <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
              <Link to="/courses">
                <PlayCircle className="size-5" /> Explore Programs
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-8 z-10 hidden justify-center text-muted-foreground sm:flex"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="size-7" />
      </motion.div>
    </section>
  );
}
