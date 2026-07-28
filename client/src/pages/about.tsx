import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { SITE } from '@/constants/site';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'To give every child who walks through our doors a strong, joyful foundation — academically and personally — that carries them confidently into every year that follows.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description:
      'To be the most trusted name in early education in Lar Town and Deoria — known for the quality of our teaching and the care we put into every child.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description:
      'Patience, discipline, and genuine warmth. We believe young children learn best when they feel safe, seen, and encouraged — never rushed or compared.',
  },
];

export function AboutPage() {
  return (
    <>
      <title>About Us | Target Classes</title>
      <meta
        name="description"
        content={`Learn about ${SITE.name}, a premium tuition institute in Lar Town, Deoria established in ${SITE.established}.`}
      />
      <PageHero
        eyebrow={`Established ${SITE.established}`}
        title="About Target Classes"
        description="A story of building a warm, disciplined, and modern learning space for the children of Lar Town."
      />

      <section className="section-container py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}>
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">Our Story</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Rooted in Lar Town, Built for Every Child</h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {SITE.name} was founded in {SITE.established} in {SITE.address} with a simple belief: young children
                deserve teachers who are patient, a classroom that feels safe, and a learning environment that grows
                with them rather than rushing them.
              </p>
              <p>
                What began as a small tuition institute has grown into a place trusted by families across Lar Town —
                built on small batches, dedicated faculty, and consistent, honest communication with parents every
                step of the way.
              </p>
              <p>
                Today, under the guidance of Director {SITE.director}, {SITE.name} continues to focus on what matters
                most in the early years: strong fundamentals, genuine care, and a foundation that lasts.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <img
              src="/images/gallery/classroom/classroom-01-lg.webp"
              alt="Target Classes classroom"
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">What Drives Us</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Mission, Vision & Values</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
