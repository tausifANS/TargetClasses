import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { TEACHERS } from '@/constants/site';

export function FacultyPage() {
  return (
    <>
      <title>Faculty | Target Classes</title>
      <meta name="description" content="Meet the dedicated faculty team at Target Classes, Lar Town, Deoria." />
      <PageHero
        eyebrow="Meet Our Team"
        title="Faculty"
        description="A small, dedicated team of teachers invested in every student's growth — in the classroom and beyond."
      />

      <section className="section-container py-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TEACHERS.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1730]/90 via-[#0A1730]/20 to-transparent" />
                {t.isDirector && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                    <Crown className="size-3" /> Director
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-base font-semibold text-white">{t.name}</h3>
                  <p className="text-sm text-white/70">{t.subjects.join(' & ')}</p>
                  {t.designation && !t.isDirector && <p className="mt-0.5 text-xs text-white/60">{t.designation}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Our faculty roster grows as Target Classes grows — check back for updates.
        </p>
      </section>
    </>
  );
}
