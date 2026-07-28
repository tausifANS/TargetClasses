import { motion } from 'framer-motion';
import { Trophy, Star, Medal } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { useToppers } from '@/hooks/use-content';

const achievementPhotos = [
  { src: '/images/gallery/topper/achievement-01-lg.webp', caption: 'Student Recognition' },
  { src: '/images/gallery/topper/achievement-02-lg.webp', caption: 'Student Recognition' },
];

export function ToppersPage() {
  const { data: toppers, isLoading } = useToppers();
  const hasToppers = (toppers?.length ?? 0) > 0;

  return (
    <>
      <title>Toppers | Target Classes</title>
      <meta name="description" content="Celebrating the achievements of our students at Target Classes." />
      <PageHero
        eyebrow="Celebrating Excellence"
        title="Our Toppers"
        description="Every child's progress matters to us — and we love celebrating the milestones along the way."
      />

      <section className="section-container py-24">
        {hasToppers ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {toppers!.map((t, i) => (
              <motion.div
                key={t.Id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-7 text-center"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Medal className="size-7" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t.StudentName}</h3>
                <p className="text-sm font-medium text-gold">{t.ClassName}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.Achievement}</p>
                {t.Year && <p className="mt-3 text-xs text-muted-foreground">{t.Year}</p>}
              </motion.div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Trophy className="size-7" />
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Results & Toppers, Published Each Term</h2>
              <p className="text-muted-foreground">
                As our student cohorts grow and complete their assessment cycles, we'll publish topper recognitions
                and results right here. In the meantime, here's a glimpse of past recognition moments at Target
                Classes.
              </p>
            </div>
          )
        )}

        {!hasToppers && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {achievementPhotos.map((p, i) => (
              <motion.div
                key={p.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <img src={p.src} alt={p.caption} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <span className="absolute bottom-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white">
                  <Star className="size-4 text-gold" /> {p.caption}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
