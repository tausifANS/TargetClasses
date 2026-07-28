import { ClipboardCheck } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';

export function ResultsPage() {
  return (
    <>
      <title>Results | Target Classes</title>
      <meta name="description" content="Exam results and academic progress at Target Classes." />
      <PageHero eyebrow="Academic Progress" title="Results" description="Term-wise results are shared directly with parents and published here after each assessment cycle." />

      <section className="section-container py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardCheck className="size-7" />
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">No Results Published Yet</h2>
          <p className="text-muted-foreground">
            Results will appear here once our first assessment cycle is complete. Parents are always informed of
            their child's progress directly by our faculty in the meantime.
          </p>
        </div>
      </section>
    </>
  );
}
