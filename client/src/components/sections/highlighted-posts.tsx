import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { usePosts } from '@/hooks/use-content';

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';

export function HighlightedPosts() {
  const { data: posts } = usePosts();
  const highlighted = posts?.filter((p) => truthy(p.Highlighted)) ?? [];

  if (highlighted.length === 0) return null;

  return (
    <section className="section-container py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-gold">Latest From Us</span>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Announcements</h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlighted.map((post, i) => (
          <motion.div
            key={post.Id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="overflow-hidden rounded-2xl border-2 border-gold/40 bg-card shadow-lg shadow-gold/10"
          >
            {post.ImageUrl ? (
              <img src={post.ImageUrl} alt={post.Title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-gold/10 text-gold">
                <Megaphone className="size-10" />
              </div>
            )}
            <div className="p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-foreground dark:text-gold">
                <Megaphone className="size-3" /> Highlighted
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{post.Title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.Body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
