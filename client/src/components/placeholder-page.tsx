import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

/** Temporary stub for pages not yet built in this phase — keeps routing complete end-to-end. */
export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <title>{`${title} | Target Classes`}</title>
      <div className="section-container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Construction className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            {description ?? 'This page is being built in an upcoming phase — check back soon.'}
          </p>
        </motion.div>
      </div>
    </>
  );
}
