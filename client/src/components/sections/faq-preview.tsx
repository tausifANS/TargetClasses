import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What classes does Target Classes currently offer?',
    a: 'We currently offer Nursery, LKG, and UKG, with more classes being added as we grow.',
  },
  {
    q: 'How do I apply for admission?',
    a: 'Fill out the Admission form on our website. Our team reviews every application and you will be notified by email once a decision is made.',
  },
  {
    q: 'What documents are required for admission?',
    a: 'A recent photograph, birth certificate, and (optionally) Aadhaar card. Additional documents can be uploaded from the admission form.',
  },
  {
    q: 'How will I know if my child is admitted?',
    a: 'Once approved, you will receive an email with the Student ID and a link to the Student Portal along with login instructions.',
  },
];

export function FaqPreview() {
  return (
    <section className="bg-secondary/40 py-24">
      <div className="section-container grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-gold">FAQs</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Common Questions</h2>
          <p className="mt-4 text-muted-foreground">
            Can't find what you're looking for?
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/faqs">
              View All FAQs <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
