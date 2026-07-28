import { BookOpen, Palette, Puzzle, Sparkles } from 'lucide-react';

export interface Course {
  slug: string;
  name: string;
  ageGroup: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  highlights: { icon: typeof BookOpen; label: string }[];
}

export const COURSES: Course[] = [
  {
    slug: 'nursery',
    name: 'Nursery',
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
