import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#16305C] to-[#060D1F] pb-16 pt-32 sm:pb-20 sm:pt-36">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="section-container relative">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <nav className="flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/85">{title}</span>
          </nav>

          {eyebrow && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-[#E8C766]">
              {eyebrow}
            </span>
          )}

          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {description && <p className="mt-4 max-w-xl text-white/70">{description}</p>}
        </motion.div>
      </div>
    </section>
  );
}
