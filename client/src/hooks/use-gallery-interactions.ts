import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth-store';

export interface GalleryComment {
  Id: string;
  UserName: string;
  Text: string;
  SubmittedAt: string;
}

export interface GalleryLikes {
  count: number;
  liked: boolean;
}

export function useGalleryInteractions(imageId: string, enabled: boolean) {
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [likes, setLikes] = useState<GalleryLikes>({ count: 0, liked: false });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    try {
      const [commentsRes, likesRes] = await Promise.all([
        api.get(`/comments/gallery/${imageId}`),
        api.get(`/comments/gallery/${imageId}/likes`),
      ]);
      setComments(commentsRes.data.data ?? []);
      setLikes(likesRes.data.data ?? { count: 0, liked: false });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [imageId, enabled]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleLike = useCallback(async () => {
    const token = getToken('user');
    if (!token) throw new Error('login_required');
    const res = await api.post(`/comments/gallery/${imageId}/likes`);
    setLikes(res.data.data);
  }, [imageId]);

  const postComment = useCallback(async (text: string) => {
    const token = getToken('user');
    if (!token) throw new Error('login_required');
    await api.post(`/comments/gallery/${imageId}`, { text });
    await fetchAll();
  }, [imageId, fetchAll]);

  return { comments, likes, loading, toggleLike, postComment, refetch: fetchAll };
}
