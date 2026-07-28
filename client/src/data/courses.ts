import { BookOpen, Palette, Puzzle, Sparkles, FlaskConical, Calculator, Microscope, Target } from 'lucide-react';

export interface Course {
  slug: string;
  name: string;
  program: 'coaching' | 'early-learner';
  ageGroup: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  highlights: { icon: typeof BookOpen; label: string }[];
}

// Primary program — Class 9th–12th coaching (Physics, Chemistry, Maths, Biology, English).
export const COACHING_COURSES: Course[] = [
  {
    slug: '9th',
    name: 'Class 9th',
    program: 'coaching',
    ageGroup: 'Foundation Batch',
    tagline: 'Building strong fundamentals for the board years ahead',
    description:
      'Class 9th lays the groundwork for everything that follows — we focus on conceptual clarity in Physics, Chemistry, Maths, and Biology so students enter Class 10 with real confidence, not just memorized formulas.',
    focusAreas: ['Concept-first teaching in core sciences & Maths', 'Regular class tests & doubt-clearing sessions', 'NCERT-aligned coursework', 'Study material & practice worksheets', 'Personal progress tracking'],
    highlights: [
      { icon: FlaskConical, label: 'Physics, Chemistry & Biology' },
      { icon: Calculator, label: 'Mathematics' },
    ],
  },
  {
    slug: '10th',
    name: 'Class 10th',
    program: 'coaching',
    ageGroup: 'Board Batch',
    tagline: 'Board exam preparation with disciplined, focused practice',
    description:
      'Our Class 10th batch is built around board exam success — rigorous practice, chapter-wise tests, and previous-year paper analysis, backed by faculty who know exactly what the board expects.',
    focusAreas: ['Board-pattern chapter tests', 'Previous year question paper practice', 'Physics, Chemistry, Biology & Maths', 'Exam strategy & time management', 'One-on-one doubt sessions'],
    highlights: [
      { icon: Target, label: 'Board exam focused' },
      { icon: Microscope, label: 'Science + Maths' },
    ],
  },
  {
    slug: '11th',
    name: 'Class 11th',
    program: 'coaching',
    ageGroup: 'Senior Secondary',
    tagline: 'Where board studies and competitive foundations meet',
    description:
      "Class 11th is where the syllabus gets serious. We teach Physics, Chemistry, Maths, and Biology with the depth needed for both board exams and the competitive exam foundation that follows in Class 12.",
    focusAreas: ['In-depth Physics, Chemistry, Biology & Maths', 'Regular tests with performance analysis', 'Strong numerical & problem-solving practice', 'Structured notes & study material', 'Foundation for competitive exams'],
    highlights: [
      { icon: FlaskConical, label: 'Physics & Chemistry' },
      { icon: Microscope, label: 'Biology' },
    ],
  },
  {
    slug: '12th',
    name: 'Class 12th',
    program: 'coaching',
    ageGroup: 'Board & Beyond',
    tagline: 'Final-year board preparation with intensive revision',
    description:
      "Class 12th is exam-focused from day one — full syllabus coverage well before boards, intensive revision cycles, and mock tests so students walk into their board exams prepared, not anxious.",
    focusAreas: ['Complete syllabus coverage & revision cycles', 'Full-length mock tests', 'Physics, Chemistry, Biology & Maths', 'Previous year paper solving', 'Individual mentoring for weak areas'],
    highlights: [
      { icon: Target, label: 'Board exam mastery' },
      { icon: Calculator, label: 'All core subjects' },
    ],
  },
];

// Secondary program — early learners.
export const EARLY_LEARNER_COURSES: Course[] = [
  {
    slug: 'nursery',
    name: 'Nursery',
    program: 'early-learner',
    ageGroup: 'Age 3 – 4 years',
    tagline: "A child's first step into structured learning",
    description:
      'Our Nursery program introduces young learners to the classroom in a warm, playful setting — building comfort, curiosity, and the earliest building blocks of language and number sense.',
    focusAreas: ['Alphabet & phonics recognition', 'Number recognition (1–20)', 'Rhymes, stories & vocabulary', 'Fine motor skills through art & craft', 'Social skills & classroom habits'],
    highlights: [
      { icon: Sparkles, label: 'Play-based learning' },
      { icon: Palette, label: 'Art & craft every week' },
    ],
  },
  {
    slug: 'lkg',
    name: 'LKG',
    program: 'early-learner',
    ageGroup: 'Age 4 – 5 years',
    tagline: 'Building reading, writing, and number foundations',
    description:
      'LKG builds on early foundations with structured reading and writing practice, expanding vocabulary, and introducing basic mathematical concepts — all paced for how young children actually learn.',
    focusAreas: ['Three-letter word reading & writing', 'Number concepts up to 50', 'Basic addition & subtraction', 'General awareness & EVS basics', 'Handwriting & pencil grip'],
    highlights: [
      { icon: BookOpen, label: 'Structured reading practice' },
      { icon: Puzzle, label: 'Concept-based learning' },
    ],
  },
  {
    slug: 'ukg',
    name: 'UKG',
    program: 'early-learner',
    ageGroup: 'Age 5 – 6 years',
    tagline: 'Getting confidently ready for Class 1',
    description:
      'UKG is our bridge to primary school — strengthening reading fluency, written expression, and mathematical confidence so every child moves into Class 1 well-prepared and self-assured.',
    focusAreas: ['Fluent reading & sentence writing', 'Numbers up to 100, basic operations', 'Environmental studies & general knowledge', 'Confidence in speaking & classroom participation', 'School-readiness habits & discipline'],
    highlights: [
      { icon: BookOpen, label: 'Class 1 readiness' },
      { icon: Sparkles, label: 'Confidence building' },
    ],
  },
];

export const COURSES: Course[] = [...COACHING_COURSES, ...EARLY_LEARNER_COURSES];
