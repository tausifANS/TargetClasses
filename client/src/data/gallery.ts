export interface GalleryItem {
  id: string;
  category: string;
  src: string;
  srcMd: string;
  thumb: string;
  caption: string;
}

export const GALLERY_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'events', label: 'Events' },
  { value: 'topper', label: 'Achievements' },
] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'classroom-01', category: 'classroom', src: '/images/gallery/classroom/classroom-01-lg.webp', srcMd: '/images/gallery/classroom/classroom-01-md.webp', thumb: '/images/gallery/classroom/classroom-01-thumb.webp', caption: 'Classroom Activities' },
  { id: 'classroom-02', category: 'classroom', src: '/images/gallery/classroom/classroom-02-lg.webp', srcMd: '/images/gallery/classroom/classroom-02-md.webp', thumb: '/images/gallery/classroom/classroom-02-thumb.webp', caption: 'Classroom Activities' },
  { id: 'annual-function-01', category: 'events', src: '/images/gallery/events/annual-function-01-lg.webp', srcMd: '/images/gallery/events/annual-function-01-md.webp', thumb: '/images/gallery/events/annual-function-01-thumb.webp', caption: 'Annual Function' },
  { id: 'annual-function-02', category: 'events', src: '/images/gallery/events/annual-function-02-lg.webp', srcMd: '/images/gallery/events/annual-function-02-md.webp', thumb: '/images/gallery/events/annual-function-02-thumb.webp', caption: 'Annual Function' },
  { id: 'annual-function-03', category: 'events', src: '/images/gallery/events/annual-function-03-lg.webp', srcMd: '/images/gallery/events/annual-function-03-md.webp', thumb: '/images/gallery/events/annual-function-03-thumb.webp', caption: 'Annual Function' },
  { id: 'diwali-01', category: 'events', src: '/images/gallery/events/diwali-01-lg.webp', srcMd: '/images/gallery/events/diwali-01-md.webp', thumb: '/images/gallery/events/diwali-01-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'diwali-02', category: 'events', src: '/images/gallery/events/diwali-02-lg.webp', srcMd: '/images/gallery/events/diwali-02-md.webp', thumb: '/images/gallery/events/diwali-02-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'diwali-03', category: 'events', src: '/images/gallery/events/diwali-03-lg.webp', srcMd: '/images/gallery/events/diwali-03-md.webp', thumb: '/images/gallery/events/diwali-03-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'diwali-04', category: 'events', src: '/images/gallery/events/diwali-04-lg.webp', srcMd: '/images/gallery/events/diwali-04-md.webp', thumb: '/images/gallery/events/diwali-04-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'diwali-05', category: 'events', src: '/images/gallery/events/diwali-05-lg.webp', srcMd: '/images/gallery/events/diwali-05-md.webp', thumb: '/images/gallery/events/diwali-05-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'diwali-06', category: 'events', src: '/images/gallery/events/diwali-06-lg.webp', srcMd: '/images/gallery/events/diwali-06-md.webp', thumb: '/images/gallery/events/diwali-06-thumb.webp', caption: 'Diwali Celebration' },
  { id: 'world-environment-day', category: 'events', src: '/images/gallery/events/world-environment-day-lg.webp', srcMd: '/images/gallery/events/world-environment-day-md.webp', thumb: '/images/gallery/events/world-environment-day-thumb.webp', caption: 'World Environment Day' },
  { id: 'achievement-01', category: 'topper', src: '/images/gallery/topper/achievement-01-lg.webp', srcMd: '/images/gallery/topper/achievement-01-md.webp', thumb: '/images/gallery/topper/achievement-01-thumb.webp', caption: 'Student Recognition' },
  { id: 'achievement-02', category: 'topper', src: '/images/gallery/topper/achievement-02-lg.webp', srcMd: '/images/gallery/topper/achievement-02-md.webp', thumb: '/images/gallery/topper/achievement-02-thumb.webp', caption: 'Student Recognition' },
];

export const GALLERY_VIDEOS = [
  { id: 'video-01', src: '/videos/video-01.mp4', caption: 'Life at Target Classes' },
  { id: 'video-02', src: '/videos/video-02.mp4', caption: 'Life at Target Classes' },
  { id: 'video-03', src: '/videos/video-03.mp4', caption: 'Life at Target Classes' },
  { id: 'video-04', src: '/videos/video-04.mp4', caption: 'Life at Target Classes' },
];
