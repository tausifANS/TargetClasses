export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'preparing-your-child-for-nursery',
    title: '5 Simple Ways to Prepare Your Child for Nursery',
    excerpt:
      'Starting nursery is a big milestone for both children and parents. Here are a few simple habits you can build at home to make the transition smoother and more confident.',
    author: 'Target Classes Team',
    date: '2026-06-02',
    readTime: '4 min read',
    category: 'Parenting Tips',
  },
  {
    slug: 'why-play-based-learning-matters',
    title: 'Why Play-Based Learning Matters in the Early Years',
    excerpt:
      "Play isn't a break from learning — for young children, it is learning. Here's why we build play into every part of our Nursery and LKG classrooms.",
    author: 'Target Classes Team',
    date: '2026-05-14',
    readTime: '5 min read',
    category: 'Early Education',
  },
  {
    slug: 'building-reading-habits-at-home',
    title: 'Building a Reading Habit at Home, One Page at a Time',
    excerpt:
      'A love of reading starts long before a child can read independently. A few small daily habits can make all the difference for children in LKG and UKG.',
    author: 'Target Classes Team',
    date: '2026-04-22',
    readTime: '4 min read',
    category: 'Early Education',
  },
];
