import { motion } from 'framer-motion';
import { FlaskConical, Atom, Beaker, Microscope, TestTubes, Pipette } from 'lucide-react';

const equipment = [
  { icon: FlaskConical, name: 'Flasks & Beakers' },
  { icon: Atom, name: 'Molecular Models' },
  { icon: Beaker, name: 'Chemical Apparatus' },
  { icon: Microscope, name: 'Microscopes' },
  { icon: TestTubes, name: 'Test Tubes & Reagents' },
  { icon: Pipette, name: 'Measuring Instruments' },
];

export function PracticalLab() {
  return (
    <section className="section-container py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#F1F4F9] to-[#FBF1D9] dark:from-[#142240] dark:to-[#1B2D52]"
        >
          <div className="grid grid-cols-3 gap-4 p-8">
            {equipment.map((e, i) => (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <e.icon className="size-7 text-primary" />
                <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">{e.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <FlaskConical className="size-4" /> Hands-On Learning
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Chemistry & Physics{' '}
            <span className="text-gold">Practical Lab</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            We believe science is best learned by <strong>doing</strong>. Our fully
            equipped practical lab gives students hands-on experience with
            Chemistry and Physics experiments using
            <strong> professional-grade equipment and materials</strong>.
          </p>
          <p className="mt-4 max-w-lg text-muted-foreground/80">
            From titrations and acid-base reactions to optics and electricity
            experiments — students build real lab skills, exam confidence, and a
            genuine love for science.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {['Chemistry Practical', 'Physics Practical', 'All Equipment Provided', 'Guided Experiments'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
