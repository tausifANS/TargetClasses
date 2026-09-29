import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/constants/site';

export function AdmissionCta() {
  return (
    <section className="section-container pb-16 sm:pb-20 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16305C] to-[#060D1F] px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-16 sm:py-20"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

        <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
          <GraduationCap className="size-7" />
        </div>
        <h2 className="relative mt-6 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Admissions Are Now Open
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/70">
          Give your child the strong start they deserve. Fill out our admission form and our team will
          get back to you shortly.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="gold" className="w-full sm:w-auto">
            <Link to="/admission">
              Apply for Admission <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
            <a href={SITE.phoneHref}>
              <Phone className="size-4" /> {SITE.phone}
            </a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
