import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeachers } from '@/hooks/use-content';
import { resolveMediaUrl } from '@/lib/api';

const isDirector = (position: string) => position?.toLowerCase().includes('director');

export function FacultyPreview() {
  const { data: teachers } = useTeachers();
  if (!teachers || teachers.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-24">
      <div className="section-container">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold">Meet Our Faculty</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Teachers Who Care</h2>
          <p className="max-w-xl text-muted-foreground">
            A small, dedicated team invested in every student's growth — in the classroom and beyond.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {teachers.slice(0, 4).map((t, i) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1730]/85 via-[#0A1730]/10 to-transparent" />
                {isDirector(t.Position) && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                    <Crown className="size-3" /> Director
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-sm font-semibold text-white sm:text-base">{t.Name}</h3>
                  <p className="text-xs text-white/70">{t.Subjects}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/faculty">
              Meet The Full Team <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
