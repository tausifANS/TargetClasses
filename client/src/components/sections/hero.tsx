import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/constants/site';

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#060D1F]">
      <video
        className="absolute inset-0 size-full object-cover opacity-45"
        src="/videos/video-01.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D1F]/70 via-[#060D1F]/60 to-[#060D1F]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060D1F] via-transparent to-transparent" />

      <div className="section-container relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-[#E8C766]">
            Established {SITE.established} &middot; Lar Town, Deoria
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Expert Coaching for <span className="text-[#E8C766]">Class 9th–12th</span> That Hits Its Target
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
            {SITE.name} prepares students for board exams with focused Physics, Chemistry, Maths &
            Biology coaching from experienced faculty — plus a nurturing Nursery–UKG program for our
            youngest learners.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="gold">
              <Link to="/admission">
                Start Admission <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link to="/courses">
                <PlayCircle className="size-5" /> Explore Programs
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center text-white/60"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="size-7" />
      </motion.div>
    </section>
  );
}
