import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const items = [
  { src: '/images/gallery/events/diwali-01-md.webp', caption: 'Diwali Celebration', span: 'sm:col-span-2 sm:row-span-2' },
  { src: '/images/gallery/events/world-environment-day-md.webp', caption: 'World Environment Day', span: '' },
  { src: '/images/gallery/topper/achievement-01-md.webp', caption: 'Student Recognition', span: '' },
  { src: '/images/gallery/events/annual-function-01-md.webp', caption: 'Annual Function', span: '' },
  { src: '/images/gallery/classroom/classroom-01-md.webp', caption: 'Classroom Activities', span: '' },
];

export function GalleryPreview() {
  return (
    <section className="section-container py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-gold">Life at Target Classes</span>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Moments Worth Remembering</h2>
        <p className="max-w-xl text-muted-foreground">Festivals, celebrations, and everyday classroom moments.</p>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2">
        {items.map((item, i) => (
          <motion.div
            key={item.caption}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`group relative overflow-hidden rounded-2xl ${item.span}`}
          >
            <img
              src={item.src}
              alt={item.caption}
              loading="lazy"
              className="size-full min-h-40 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100" />
            <span className="absolute bottom-3 left-3 text-sm font-medium text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              {item.caption}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/gallery">
            <ImageIcon className="size-4" /> View Full Gallery <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
