import { Hero } from '@/components/sections/hero';
import { QuickFacts } from '@/components/sections/quick-facts';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { FacultyPreview } from '@/components/sections/faculty-preview';
import { GalleryPreview } from '@/components/sections/gallery-preview';
import { AdmissionCta } from '@/components/sections/admission-cta';
import { FaqPreview } from '@/components/sections/faq-preview';

export function HomePage() {
  return (
    <>
      <title>Target Classes | Premium Tuition Institute in Lar, Deoria</title>
      <meta
        name="description"
        content="Target Classes is a premier tuition institute in Lar Town, Deoria (UP), established 2019 — offering Nursery to UKG with experienced faculty and a modern learning environment."
      />
      <Hero />
      <QuickFacts />
      <WhyChooseUs />
      <FacultyPreview />
      <GalleryPreview />
      <FaqPreview />
      <AdmissionCta />
    </>
  );
}
