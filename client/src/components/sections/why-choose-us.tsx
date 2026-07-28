import { motion } from 'framer-motion';
import { Users, BookOpenCheck, ShieldCheck, HeartHandshake, Building2, MessageCircleHeart } from 'lucide-react';

const points = [
  {
    icon: Users,
    title: 'Small Batches, Real Attention',
    description: 'We keep batches small so every child is seen, heard, and guided individually — not lost in a crowd.',
  },
  {
    icon: BookOpenCheck,
    title: 'Experienced Faculty',
    description: 'Our teachers specialize in their subjects and in teaching young learners with patience and care.',
  },
  {
    icon: Building2,
    title: 'Nurturing Environment',
    description: 'A clean, cheerful, activity-friendly classroom designed for how young children actually learn.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Supervised',
    description: 'Every child is supervised closely throughout the day, with attendance tracked and shared with parents.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Open Parent Communication',
    description: 'Regular updates on your child’s progress — no surprises, just steady partnership.',
  },
  {
    icon: HeartHandshake,
    title: 'Values-First Foundation',
    description: 'Alongside academics, we build discipline, curiosity, and confidence from the very first year.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-gold">Why Target Classes</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Built Around Every Child</h2>
        <p className="mt-4 text-muted-foreground">
          Everything at Target Classes is designed around one goal — helping your child build a strong,
          confident foundation for everything that comes next.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
              <p.icon className="size-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
