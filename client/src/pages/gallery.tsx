import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, GALLERY_VIDEOS, type GalleryItem } from '@/data/gallery';
import { useGalleryItems } from '@/hooks/use-content';
import { resolveMediaUrl, api } from '@/lib/api';
import { useIsStudentLoggedIn } from '@/hooks/use-portal';

interface GalleryComment {
  id: number;
  name: string;
  text: string;
  created_at: string;
}

function GalleryLikeComment({ imageId }: { imageId: string | number }) {
  const loggedIn = useIsStudentLoggedIn();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          api.get(`/comments/gallery/${imageId}/likes`),
          api.get(`/comments/gallery/${imageId}`),
        ]);
        if (cancelled) return;
        setLikes(likesRes.data?.count ?? 0);
        setLiked(likesRes.data?.liked ?? false);
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [imageId]);

  const toggleLike = async () => {
    if (!loggedIn) return;
    try {
      const res = await api.post(`/comments/gallery/${imageId}/likes`);
      setLikes(res.data?.count ?? likes);
      setLiked(res.data?.liked ?? !liked);
    } catch { /* ignore */ }
  };

  const postComment = async () => {
    if (!loggedIn || !commentText.trim()) return;
    const name = commentName.trim() || 'Student';
    try {
      const res = await api.post(`/comments/gallery/${imageId}`, { name, text: commentText.trim() });
      const newComment = res.data;
      if (newComment) setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch { /* ignore */ }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Like button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Heart
            size={18}
            className={liked ? 'fill-red-500 text-red-500' : 'text-white/60'}
          />
          <span className="text-white">{likes}</span>
        </button>
        <span className="flex items-center gap-2 text-sm text-white/50">
          <MessageCircle size={16} />
          {comments.length}
        </span>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {!loading && comments.length === 0 && (
          <p className="text-sm text-white/40 italic">No comments yet. Be the first!</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gold">{c.name}</span>
              <span className="text-xs text-white/30">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Comment input */}
      {loggedIn ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
            <button
              type="button"
              onClick={postComment}
              disabled={!commentText.trim()}
              className="flex items-center justify-center rounded-xl px-4 py-2.5 text-white transition-colors hover:bg-gold/20 disabled:opacity-30"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-white/40">
          Log in as a student to like and comment
        </p>
      )}
    </div>
  );
}

function GalleryGrid({ items, onSelect }: { items: GalleryItem[]; onSelect: (item: GalleryItem) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          className="group relative aspect-square overflow-hidden rounded-2xl text-left"
        >
          <img
            src={item.srcMd}
            alt={item.caption}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 text-sm font-medium text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {item.caption}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function GalleryPage() {
  const [active, setActive] = useState<GalleryItem | null>(null);
  const { data: uploaded } = useGalleryItems();

  const allItems = useMemo<GalleryItem[]>(() => {
    const fromAdmin: GalleryItem[] = (uploaded ?? []).map((row) => {
      const url = resolveMediaUrl(row.ImageUrl) ?? row.ImageUrl;
      return {
        id: row.Id,
        category: row.Category || 'classroom',
        src: url,
        srcMd: url,
        thumb: url,
        caption: row.Caption || 'Target Classes',
      };
    });
    // Newest admin uploads first, static launch photos after.
    return [...fromAdmin, ...GALLERY_ITEMS];
  }, [uploaded]);

  return (
    <>
      <title>Gallery | Target Classes</title>
      <meta name="description" content="Browse photos and videos of classroom activities, celebrations, and events at Target Classes." />
      <PageHero
        eyebrow="Life at Target Classes"
        title="Gallery"
        description="Festivals, celebrations, and everyday classroom moments from around our institute."
      />

      <section className="section-container py-24">
        <Tabs defaultValue="all">
          <TabsList className="mx-auto flex h-auto w-fit flex-wrap gap-1 bg-secondary/60 p-1.5">
            {GALLERY_CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="rounded-full px-4 py-2 text-sm">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-10">
            {GALLERY_CATEGORIES.map((c) => (
              <TabsContent key={c.value} value={c.value}>
                <GalleryGrid
                  items={c.value === 'all' ? allItems : allItems.filter((i) => i.category === c.value)}
                  onSelect={setActive}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="section-container">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">Watch</span>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Videos</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {GALLERY_VIDEOS.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl bg-card ring-1 ring-border"
              >
                <video src={v.src} controls preload="metadata" className="aspect-video w-full bg-black" />
                <p className="p-4 text-sm font-medium">{v.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{active?.caption ?? 'Gallery image'}</DialogTitle>
          {active && (
            <div>
              <img src={active.src} alt={active.caption} className="max-h-[80vh] w-full rounded-2xl object-contain" />
              <p className="pt-4 text-center font-display text-base font-semibold text-white">{active.caption}</p>
              <GalleryLikeComment imageId={active.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
