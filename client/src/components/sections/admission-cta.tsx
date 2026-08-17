import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdmissionCta() {
  return (
    <section className="section-container pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16305C] to-[#060D1F] px-8 py-16 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <GraduationCap className="size-7" />
        </div>
        <h2 className="relative mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
          Admissions Are Now Open
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/70">
          Give your child the strong start they deserve. Fill out our admission form and our team will
          get back to you shortly.
        </p>
        <Button asChild size="lg" variant="gold" className="relative mt-8 w-full sm:w-auto">
          <Link to="/admission">
            Apply for Admission <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
