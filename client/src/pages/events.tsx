import { motion } from 'framer-motion';
import { CalendarDays, CalendarClock } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { GALLERY_ITEMS } from '@/data/gallery';
import { useEvents } from '@/hooks/use-content';

const eventGroups = [
  {
    title: 'Diwali Celebration',
    items: GALLERY_ITEMS.filter((i) => i.id.startsWith('diwali')),
  },
  {
    title: 'Annual Function',
    items: GALLERY_ITEMS.filter((i) => i.id.startsWith('annual-function')),
  },
  {
    title: 'World Environment Day',
    items: GALLERY_ITEMS.filter((i) => i.id === 'world-environment-day'),
  },
];

export function EventsPage() {
  const { data: upcomingEvents } = useEvents();
  const hasUpcoming = (upcomingEvents?.length ?? 0) > 0;

  return (
    <>
      <title>Events | Target Classes</title>
      <meta name="description" content="Celebrations and events at Target Classes — Diwali, Annual Function, and more." />
      <PageHero eyebrow="Beyond the Classroom" title="Events" description="Festivals, celebrations, and special days that make life at Target Classes memorable." />

      <section className="section-container py-24 space-y-20">
        {hasUpcoming && (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarClock className="size-5" />
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Upcoming</h2>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents!.map((e, i) => (
                <motion.div
                  key={e.Id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-display text-lg font-semibold">{e.Title}</h3>
                  {e.EventDate && (
                    <p className="mt-1 text-sm font-medium text-gold">
                      {new Date(e.EventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.Description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {eventGroups.map((group, gi) => (
          <div key={group.title}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <CalendarDays className="size-5" />
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{group.title}</h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: (gi * 0.1) + i * 0.05 }}
                  className="overflow-hidden rounded-2xl"
                >
                  <img src={item.srcMd} alt={item.caption} loading="lazy" className="aspect-square w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
