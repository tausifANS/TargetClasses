import { PageHero } from '@/components/layout/page-hero';
import { SITE } from '@/constants/site';

const sections = [
  {
    title: 'Information We Collect',
    body: `When you use our Admission or Contact forms, we collect the details you choose to share — such as student name, date of birth, parent/guardian name, phone number, email, and address. This information is sent directly to our admissions team via WhatsApp and is not stored on our servers at this time.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use the information you provide solely to respond to admission inquiries, contact requests, and to communicate with you about ${SITE.name}. We do not sell or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: 'Cookies & Analytics',
    body: `Our website may use basic, privacy-respecting analytics to understand how visitors use our site and improve it over time. We do not use tracking cookies for advertising purposes.`,
  },
  {
    title: 'Third-Party Services',
    body: `Our website links to WhatsApp and YouTube for communication and content purposes. When you interact with these services, their respective privacy policies apply.`,
  },
  {
    title: 'Data Security',
    body: `We take reasonable measures to protect any information shared with us. As our Student Portal and online systems go live, this policy will be updated to reflect how account and academic data is stored and secured.`,
  },
  {
    title: 'Your Rights',
    body: `You may contact us at any time to ask what information we hold about you or to request that it be removed from our records.`,
  },
  {
    title: 'Contact Us',
    body: `If you have questions about this Privacy Policy, please reach out to us at ${SITE.email} or ${SITE.phone}.`,
  },
];

export function PrivacyPolicyPage() {
  return (
    <>
      <title>Privacy Policy | Target Classes</title>
      <meta name="description" content={`Privacy Policy for ${SITE.name}.`} />
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated July 2026. Here's how we handle information shared with us." />

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
