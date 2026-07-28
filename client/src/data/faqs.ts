export interface Faq {
  question: string;
  answer: string;
  category: 'Admissions' | 'Academics' | 'Fees & Logistics';
}

export const FAQS: Faq[] = [
  {
    category: 'Admissions',
    question: 'What classes does Target Classes currently offer?',
    answer: 'We currently offer Nursery, LKG, and UKG, with more classes being added as we grow.',
  },
  {
    category: 'Admissions',
    question: 'How do I apply for admission?',
    answer: 'Fill out the Admission form on our website or WhatsApp us directly. Our team reviews every application and gets back to you promptly.',
  },
  {
    category: 'Admissions',
    question: 'What documents are required for admission?',
    answer: 'A recent photograph, birth certificate, and (optionally) Aadhaar card. Additional documents can be shared with our team on request.',
  },
  {
    category: 'Admissions',
    question: 'How will I know if my child is admitted?',
    answer: 'Once approved, our team will contact you directly with confirmation and the next steps for enrollment.',
  },
  {
    category: 'Admissions',
    question: 'Is there an entrance test for admission?',
    answer: 'No formal entrance test for Nursery to UKG. Admission is based on a simple interaction to understand your child\'s comfort level.',
  },
  {
    category: 'Academics',
    question: 'What is the student-to-teacher ratio like?',
    answer: 'We intentionally keep our batches small so every child gets individual attention from our faculty.',
  },
  {
    category: 'Academics',
    question: 'Do you provide progress updates to parents?',
    answer: 'Yes — our teachers regularly share updates on your child\'s progress so you\'re always in the loop.',
  },
  {
    category: 'Academics',
    question: 'What is the medium of instruction?',
    answer: 'Our classes are taught with a strong focus on English, alongside Hindi, to build well-rounded language skills from an early age.',
  },
  {
    category: 'Fees & Logistics',
    question: 'What are the class timings?',
    answer: 'Please contact us directly on phone or WhatsApp for current class timings and batch availability.',
  },
  {
    category: 'Fees & Logistics',
    question: 'What is the fee structure?',
    answer: 'Fee details vary by class and are shared with parents directly by our admissions team — reach out to us for the current structure.',
  },
  {
    category: 'Fees & Logistics',
    question: 'Where is Target Classes located?',
    answer: 'We are located in Lar Town, near the Thana, in Deoria, Uttar Pradesh.',
  },
];

export const FAQ_CATEGORIES = ['Admissions', 'Academics', 'Fees & Logistics'] as const;
