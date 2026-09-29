import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="dark relative overflow-hidden bg-gradient-to-br from-secondary to-background pb-16 pt-32 sm:pb-20 sm:pt-36">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="section-container relative">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground/85">{title}</span>
          </nav>

          {eyebrow && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {eyebrow}
            </span>
          )}

          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {description && <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>}
        </motion.div>
      </div>
    </section>
  );
}
