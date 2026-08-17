import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, User, LogIn } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, GALLERY_VIDEOS, type GalleryItem } from '@/data/gallery';
import { useGalleryItems } from '@/hooks/use-content';
import { resolveMediaUrl } from '@/lib/api';
import { useIsUserLoggedIn, useUserLogin, useUserSignup } from '@/hooks/use-user-auth';
import { useGalleryInteractions } from '@/hooks/use-gallery-interactions';
import { toast } from 'sonner';

// ---- Auth Dialog ----

function GalleryAuthDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const loginMut = useUserLogin();
  const signupMut = useUserSignup();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await loginMut.mutateAsync({ email: String(fd.get('email')), password: String(fd.get('password')) });
      toast.success('Logged in!');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await signupMut.mutateAsync({ name: String(fd.get('name')), email: String(fd.get('email')), password: String(fd.get('password')) });
      toast.success('Account created! You are now logged in.');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border bg-card p-0">
        <DialogTitle className="sr-only">Login or Sign Up</DialogTitle>
        <div className="p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" required placeholder="your@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-pass">Password</Label>
                  <Input id="login-pass" name="password" type="password" required />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={loginMut.isPending}>
                  <LogIn className="size-4" /> Log In
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="name" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required placeholder="your@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-pass">Password</Label>
                  <Input id="signup-pass" name="password" type="password" required minLength={6} />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={signupMut.isPending}>
                  <User className="size-4" /> Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Like & Comment Section ----

function GalleryLikeComment({ imageId }: { imageId: string }) {
  const { comments, likes, toggleLike, postComment } = useGalleryInteractions(imageId, true);
  const [commentText, setCommentText] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const isLoggedIn = useIsUserLoggedIn();

  const handleLike = async () => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    try { await toggleLike(); } catch { setShowAuth(true); }
  };

  const handleComment = async () => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    if (!commentText.trim()) return;
    try {
      await postComment(commentText.trim());
      setCommentText('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center gap-5">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${likes.liked ? 'text-red-400' : 'text-white/70 hover:text-red-400'}`}>
          <Heart className={`size-5 ${likes.liked ? 'fill-current' : ''}`} /> {likes.count}
        </button>
        <span className="flex items-center gap-1.5 text-sm text-white/70">
          <MessageCircle className="size-5" /> {comments.length}
        </span>
      </div>

      {comments.length > 0 && (
        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.Id} className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gold">{c.UserName}</span>
                <span className="text-white/40">{new Date(c.SubmittedAt).toLocaleDateString('en-IN')}</span>
              </div>
              <p className="mt-1 text-sm text-white/90">{c.Text}</p>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <div className="mt-3 flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
            placeholder="Write a comment..."
            className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
          />
          <Button size="icon" variant="gold" onClick={handleComment} disabled={!commentText.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      ) : (
        <button onClick={() => setShowAuth(true)} className="mt-3 text-xs text-gold hover:underline">
          Log in to like and comment
        </button>
      )}

      <GalleryAuthDialog open={showAuth} onOpenChange={setShowAuth} onSuccess={() => {}} />
    </div>
  );
}

// ---- Gallery Grid ----

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

// ---- Main Gallery Page ----

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
        <DialogContent className="max-w-3xl border-none bg-[#0c1a30] p-6 shadow-none">
          <DialogTitle className="sr-only">{active?.caption ?? 'Gallery image'}</DialogTitle>
          {active && (
            <div>
              <img src={active.src} alt={active.caption} className="max-h-[60vh] w-full rounded-2xl object-contain" />
              <p className="pt-3 text-center font-display text-base font-semibold text-white">{active.caption}</p>
              <GalleryLikeComment imageId={active.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
