import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TestimonialRow {
  Id: string;
  ParentName: string;
  StudentName?: string;
  Message: string;
  Rating?: number | string;
}

export interface NoticeRow {
  Id: string;
  SubmittedAt: string;
  Title: string;
  Body: string;
}

export interface EventRow {
  Id: string;
  Title: string;
  Description: string;
  EventDate: string;
}

export interface TopperRow {
  Id: string;
  StudentName: string;
  ClassName: string;
  Achievement: string;
  Year: string | number;
}

export interface PostRow {
  Id: string;
  SubmittedAt: string;
  Title: string;
  Body: string;
  ImageUrl?: string;
  Highlighted?: boolean | string;
}

export interface GalleryItemRow {
  Id: string;
  SubmittedAt: string;
  Category: string;
  ImageUrl: string;
  Caption?: string;
}

async function fetchContent<T>(sheet: string): Promise<T[]> {
  const res = await api.get(`/content/${sheet}`);
  return res.data.data ?? [];
}

// Content endpoints depend on Google Sheets being configured server-side — if it
// isn't yet, the API returns an error, which we treat as "no content" rather than
// surfacing an error state on these pages (they all have a graceful empty state).
function useContentQuery<T>(key: string, sheet: string) {
  return useQuery<T[]>({
    queryKey: ['content', key],
    queryFn: () => fetchContent<T>(sheet),
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  });
}

export const useTestimonials = () => useContentQuery<TestimonialRow>('testimonials', 'testimonials');
export const useNotices = () => useContentQuery<NoticeRow>('notices', 'notices');
export const useEvents = () => useContentQuery<EventRow>('events', 'events');
export const useToppers = () => useContentQuery<TopperRow>('toppers', 'toppers');
export const usePosts = () => useContentQuery<PostRow>('posts', 'posts');
export const useGalleryItems = () => useContentQuery<GalleryItemRow>('gallery-items', 'gallery-items');
