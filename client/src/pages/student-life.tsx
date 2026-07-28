import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Users2, PartyPopper, BookHeart } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    icon: BookHeart,
    title: 'Everyday Learning',
    description: 'Structured lessons balanced with stories, songs, and hands-on activities that make learning feel natural.',
    image: '/images/gallery/classroom/classroom-01-md.webp',
  },
  {
    icon: Palette,
    title: 'Creative Expression',
    description: 'Art, craft, and creative play are part of the weekly rhythm — building fine motor skills and imagination.',
    image: '/images/gallery/classroom/classroom-02-md.webp',
  },
  {
    icon: PartyPopper,
    title: 'Festivals & Celebrations',
    description: 'From Diwali to Annual Function, we celebrate together — building a sense of community and joy.',
    image: '/images/gallery/events/diwali-01-md.webp',
  },
  {
    icon: Users2,
    title: 'Social Growth',
    description: 'Group activities help children build friendships, share, and grow their confidence alongside peers.',
    image: '/images/gallery/events/annual-function-01-md.webp',
  },
];

export function StudentLifePage() {
  return (
    <>
      <title>Student Life | Target Classes</title>
      <meta name="description" content="A glimpse into everyday student life at Target Classes." />
      <PageHero eyebrow="A Day in the Life" title="Student Life" description="Learning at Target Classes goes beyond the textbook — here's what everyday life looks like for our students." />

      <section className="section-container py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={p.image} alt={p.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/gallery">
              See More in the Gallery <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
