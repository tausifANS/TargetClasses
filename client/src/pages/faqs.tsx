import { PageHero } from '@/components/layout/page-hero';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { FAQS, FAQ_CATEGORIES } from '@/data/faqs';

export function FaqsPage() {
  return (
    <>
      <title>FAQs | Target Classes</title>
      <meta name="description" content="Frequently asked questions about admissions, academics, fees, and logistics at Target Classes." />
      <PageHero eyebrow="Got Questions?" title="Frequently Asked Questions" description="Everything you need to know about admissions, academics, and life at Target Classes." />

      <section className="section-container py-24">
        <div className="mx-auto max-w-3xl space-y-14">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category}>
              <h2 className="font-display text-xl font-bold sm:text-2xl">{category}</h2>
              <Accordion type="single" collapsible className="mt-6 flex flex-col gap-3">
                {FAQS.filter((f) => f.category === category).map((f, i) => (
                  <AccordionItem key={i} value={`${category}-${i}`}>
                    <AccordionTrigger>{f.question}</AccordionTrigger>
                    <AccordionContent>{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
