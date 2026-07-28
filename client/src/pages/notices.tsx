import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { useNotices } from '@/hooks/use-content';

export function NoticesPage() {
  const { data: notices, isLoading } = useNotices();
  const hasNotices = (notices?.length ?? 0) > 0;

  return (
    <>
      <title>Notice Board | Target Classes</title>
      <meta name="description" content="Latest notices and announcements from Target Classes." />
      <PageHero eyebrow="Stay Updated" title="Notice Board" description="Important announcements and updates from Target Classes, published here as they happen." />

      <section className="section-container py-24">
        {hasNotices ? (
          <div className="mx-auto max-w-2xl space-y-5">
            {notices!.map((n, i) => (
              <motion.div
                key={n.Id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">{n.Title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.Body}</p>
                    {n.SubmittedAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(n.SubmittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Megaphone className="size-7" />
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">No Notices Right Now</h2>
              <p className="text-muted-foreground">
                There are no active announcements at the moment. Check back soon, or reach out to us directly if you
                have an urgent question.
              </p>
            </div>
          )
        )}
      </section>
    </>
  );
}
