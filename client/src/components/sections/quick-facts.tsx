import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Counter } from '@/components/ui/counter';
import { SITE, CLASSES } from '@/constants/site';
import { useTeachers } from '@/hooks/use-content';

export function QuickFacts() {
  const { data: teachers } = useTeachers();
  const facts = [
    { value: new Date().getFullYear() - SITE.established, suffix: '+', label: 'Years of Excellence' },
    { value: teachers?.length ?? 0, suffix: '', label: 'Expert Faculty Members' },
    { value: CLASSES.length, suffix: '', label: 'Programs Offered' },
  ];

  return (
    <section className="relative -mt-16 z-20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 sm:grid-cols-4 sm:p-10"
        >
          {facts.map((f) => (
            <div key={f.label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary sm:text-4xl">
                <Counter value={f.value} suffix={f.suffix} />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.label}</p>
            </div>
          ))}
          <div className="col-span-2 text-center sm:col-span-1">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-gold/15 text-gold sm:size-12">
              <Sparkles className="size-5 sm:size-6" />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">Personalized, One-on-One Attention</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
