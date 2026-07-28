import { PageHero } from '@/components/layout/page-hero';
import { SITE } from '@/constants/site';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: `By using this website, you agree to these Terms & Conditions. If you do not agree, please discontinue use of the site.`,
  },
  {
    title: 'Admissions',
    body: `Submitting an admission inquiry through our website does not guarantee enrollment. All admissions are subject to review, seat availability, and confirmation by ${SITE.name}'s admissions team.`,
  },
  {
    title: 'Use of Content',
    body: `All text, images, and videos on this website belong to ${SITE.name} unless otherwise noted, and may not be reproduced or used elsewhere without our written permission.`,
  },
  {
    title: 'Accuracy of Information',
    body: `We make every effort to keep information on this site accurate and up to date, including course details, fees, and contact information. However, details are subject to change — please confirm with our team directly for the most current information.`,
  },
  {
    title: 'Third-Party Links',
    body: `Our website may link to third-party services such as WhatsApp, YouTube, or Google Maps. We are not responsible for the content or practices of these external sites.`,
  },
  {
    title: 'Limitation of Liability',
    body: `${SITE.name} is not liable for any indirect or incidental damages arising from the use of this website or reliance on its content.`,
  },
  {
    title: 'Changes to These Terms',
    body: `We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted constitutes acceptance of the updated terms.`,
  },
  {
    title: 'Contact',
    body: `Questions about these terms can be directed to ${SITE.email} or ${SITE.phone}.`,
  },
];

export function TermsPage() {
  return (
    <>
      <title>Terms & Conditions | Target Classes</title>
      <meta name="description" content={`Terms & Conditions for ${SITE.name}.`} />
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="Last updated July 2026. Please review these terms before using our website." />

      <section className="section-container py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl font-bold">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
