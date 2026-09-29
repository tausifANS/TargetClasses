import { motion } from 'framer-motion';
import { MonitorPlay, Sparkles, Wifi, Zap } from 'lucide-react';

const features = [
  { icon: MonitorPlay, label: 'Interactive TV Board' },
  { icon: Sparkles, label: 'Animated Lessons' },
  { icon: Wifi, label: 'Connected Learning' },
  { icon: Zap, label: 'Visual Concepts' },
];

export function SmartClasses() {
  return (
    <section className="dark relative overflow-hidden bg-gradient-to-br from-card via-secondary to-card py-16 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-chart-3/15 blur-3xl" />

      <div className="section-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <MonitorPlay className="size-4" /> Smart Education
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Digital Smart Classes with{' '}
              <span className="text-primary">TV Board</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              At Target Classes, learning goes beyond chalk and talk. Our
              <strong className="text-foreground"> interactive TV Board </strong>
              brings every topic to life with animations, diagrams, and visual
              explanations — so students don't just memorise, they
              <strong className="text-foreground"> understand </strong>
              the concept deeply.
            </p>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Whether it's a complex Physics diagram, a Chemistry reaction, or a
              Maths theorem — our smart board makes every lesson engaging, visual,
              and easy to grasp for students of all ages.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/60 p-4 text-center"
                >
                  <f.icon className="size-6 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl border border-border bg-card/60 shadow-2xl shadow-black/20"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,199,102,0.12),transparent_65%)]" />
            <div className="relative flex flex-col items-center gap-4 p-8 text-center">
              <motion.div
                className="flex size-20 items-center justify-center rounded-2xl bg-primary/15"
                animate={{ boxShadow: ['0 0 0 0 rgba(232,199,102,0.35)', '0 0 0 14px rgba(232,199,102,0)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              >
                <MonitorPlay className="size-10 text-primary" />
              </motion.div>
              <p className="font-display text-xl font-bold text-foreground">Interactive TV Board</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Animated lessons, real-time diagrams, and visual explanations that make every concept click.
              </p>
              <div className="mt-2 flex gap-3">
                {['Physics', 'Chemistry', 'Maths', 'Biology'].map((s) => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
