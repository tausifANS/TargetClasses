import { motion } from 'framer-motion';
import { CalendarDays, Clock } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Badge } from '@/components/ui/badge';
import { BLOG_POSTS } from '@/data/blogs';

export function BlogsPage() {
  return (
    <>
      <title>Blogs | Target Classes</title>
      <meta name="description" content="Parenting tips and early education insights from Target Classes." />
      <PageHero eyebrow="Insights & Tips" title="Blog" description="Thoughts on early education and parenting from our team, written for the families we serve." />

      <section className="section-container py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg sm:p-8"
            >
              <Badge variant="gold">{post.category}</Badge>
              <h2 className="mt-4 font-display text-xl font-bold sm:text-2xl">{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {post.readTime}
                </span>
                <span>By {post.author}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
