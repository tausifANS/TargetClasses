import { motion } from 'framer-motion';
import { Award, Users, BookOpenCheck, Sparkles } from 'lucide-react';
import { Counter } from '@/components/ui/counter';
import { SITE, CLASSES } from '@/constants/site';
import { useTeachers } from '@/hooks/use-content';

export function QuickFacts() {
  const { data: teachers } = useTeachers();
  const facts = [
    { icon: Award, value: new Date().getFullYear() - SITE.established, suffix: '+', label: 'Years of Excellence' },
    { icon: Users, value: teachers?.length ?? 0, suffix: '', label: 'Expert Faculty Members' },
    { icon: BookOpenCheck, value: CLASSES.length, suffix: '', label: 'Programs Offered' },
  ];

  return (
    <section className="relative z-20 mt-0 sm:-mt-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 sm:grid-cols-4 sm:gap-4 sm:p-10 sm:divide-x sm:divide-border"
        >
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2 text-center sm:px-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-11">
                <f.icon className="size-5" />
              </div>
              <div className="font-display text-3xl font-bold text-primary sm:text-4xl">
                <Counter value={f.value} suffix={f.suffix} />
              </div>
              <p className="text-sm text-muted-foreground">{f.label}</p>
            </div>
          ))}
          <div className="col-span-2 flex flex-col items-center gap-2 text-center sm:col-span-1 sm:px-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold sm:size-11">
              <Sparkles className="size-5" />
            </div>
            <div className="hidden font-display text-3xl font-bold text-primary opacity-0 sm:block sm:text-4xl" aria-hidden>0</div>
            <p className="text-sm text-muted-foreground">Personalized, One-on-One Attention</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
