import { motion } from 'framer-motion';
import { Crown, Users2 } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { useTeachers } from '@/hooks/use-content';
import { resolveMediaUrl } from '@/lib/api';

const isDirector = (position: string) => position?.toLowerCase().includes('director');

export function FacultyPage() {
  const { data: teachers, isLoading } = useTeachers();
  const hasTeachers = (teachers?.length ?? 0) > 0;

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
        {hasTeachers ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teachers!.map((t, i) => (
              <motion.div
                key={t.Id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  {t.PhotoUrl && (
                    <img
                      src={resolveMediaUrl(t.PhotoUrl)}
                      alt={t.Name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1730]/90 via-[#0A1730]/20 to-transparent" />
                  {isDirector(t.Position) && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                      <Crown className="size-3" /> Director
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-base font-semibold text-white">{t.Name}</h3>
                    <p className="text-sm text-white/70">{t.Subjects}</p>
                    {!isDirector(t.Position) && <p className="mt-0.5 text-xs text-white/60">{t.Position}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users2 className="size-7" />
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Faculty Coming Soon</h2>
              <p className="text-muted-foreground">Our faculty roster is being updated — check back soon.</p>
            </div>
          )
        )}

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Our faculty roster grows as Target Classes grows — check back for updates.
        </p>
      </section>
    </>
  );
}
