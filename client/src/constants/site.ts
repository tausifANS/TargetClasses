export const SITE = {
  name: 'Target Classes',
  tagline: 'Aim High. Achieve More.',
  established: 2019,
  director: 'Naushad Ansari',
  phone: '+91 72339 81206',
  phoneHref: 'tel:+917233981206',
  whatsapp: '+91 72339 81206',
  whatsappHref: 'https://wa.me/917233981206',
  email: 'tausif5310ans@gmail.com',
  address: 'Lar Town, Near Thana, Deoria, Uttar Pradesh',
  youtube: 'https://youtube.com/@target786?si=0Jn3DJf4g2YXgBes',
  instagram: 'https://www.instagram.com/targetscienceacademy?igsh=MXZseGNtNDU4cnU4cQ==',
  mapEmbedQuery: 'Lar Town Near Thana Deoria Uttar Pradesh',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Toppers', href: '/toppers' },
  { label: 'Results', href: '/results' },
  { label: 'Events', href: '/events' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_LINKS = {
  institute: [
    { label: 'About Us', href: '/about' },
    { label: 'Faculty', href: '/faculty' },
    { label: 'Student Life', href: '/student-life' },
    { label: 'Notice Board', href: '/notices' },
    { label: 'Careers', href: '/careers' },
  ],
  resources: [
    { label: 'Admission', href: '/admission' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Support', href: '/support' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
} as const;

export interface Teacher {
  slug: string;
  name: string;
  subjects: string[];
  designation?: string;
  isDirector?: boolean;
  photo: string;
  photoThumb: string;
  hasRealPhoto: boolean;
}

export const TEACHERS: Teacher[] = [
  {
    slug: 'naushad-ansari',
    name: 'Naushad Ansari',
    subjects: ['Physics'],
    designation: 'Director',
    isDirector: true,
    photo: '/brand/faculty-placeholder-na.svg',
    photoThumb: '/brand/faculty-placeholder-na.svg',
    hasRealPhoto: false,
  },
  {
    slug: 'shahnawaz',
    name: 'Shahnawaz',
    subjects: ['Mathematics', 'Chemistry'],
    photo: '/brand/faculty-placeholder-s.svg',
    photoThumb: '/brand/faculty-placeholder-s.svg',
    hasRealPhoto: false,
  },
  {
    slug: 'abdul-samad-ansari',
    name: 'Abdul Samad Ansari',
    subjects: ['English'],
    photo: '/images/faculty/abdul-samad-english.webp',
    photoThumb: '/images/faculty/abdul-samad-english-thumb.webp',
    hasRealPhoto: true,
  },
  {
    slug: 'sanjay-sir',
    name: 'Sanjay Sir',
    subjects: ['Biology'],
    photo: '/images/faculty/sanjay-biology.webp',
    photoThumb: '/images/faculty/sanjay-biology-thumb.webp',
    hasRealPhoto: true,
  },
];

// Primary program: coaching for Class 9th–12th (Physics/Chemistry/Maths/Biology/English).
export const COACHING_CLASSES = ['9th', '10th', '11th', '12th'] as const;
// Secondary program: early learners.
export const EARLY_LEARNER_CLASSES = ['Nursery', 'LKG', 'UKG'] as const;
// All classes offered — used by the Admission form's class selector.
export const CLASSES = [...COACHING_CLASSES, ...EARLY_LEARNER_CLASSES] as const;
