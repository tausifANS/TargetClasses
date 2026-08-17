import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Heart, MessageCircle, Send } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BLOG_POSTS } from '@/data/blogs';
import { useIsStudentLoggedIn } from '@/hooks/use-portal';

function LikeCommentSection({ targetId }: { targetId: string }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Array<{ name: string; text: string; date: string }>>([]);
  const [commentText, setCommentText] = useState('');
  const isLoggedIn = useIsStudentLoggedIn();

  const toggleLike = () => {
    if (!isLoggedIn) return;
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const addComment = () => {
    if (!commentText.trim() || !isLoggedIn) return;
    setComments((prev) => [...prev, { name: 'Student', text: commentText.trim(), date: new Date().toISOString() }]);
    setCommentText('');
  };

  return (
    <div className="mt-5 border-t border-border pt-4" data-target={targetId}>
      <div className="flex items-center gap-4">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}>
          <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} /> {likes}
        </button>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="size-4" /> {comments.length}
        </span>
      </div>

      {comments.length > 0 && (
        <ul className="mt-3 space-y-2">
          {comments.map((c, i) => (
            <li key={i} className="rounded-lg bg-muted/50 p-3 text-xs">
              <span className="font-semibold">{c.name}</span>
              <span className="ml-2 text-muted-foreground">{new Date(c.date).toLocaleDateString('en-IN')}</span>
              <p className="mt-1">{c.text}</p>
            </li>
          ))}
        </ul>
      )}

      {isLoggedIn && (
        <div className="mt-3 flex gap-2">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="text-sm"
          />
          <Button size="sm" variant="gold" onClick={addComment} disabled={!commentText.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      )}
      {!isLoggedIn && <p className="mt-2 text-xs text-muted-foreground">Log in as a student to like and comment.</p>}
    </div>
  );
}

export function BlogsPage() {
  return (
    <>
      <title>Blogs | Target Classes</title>
      <meta name="description" content="Parenting tips and early education insights from Target Classes." />
      <PageHero eyebrow="Insights & Tips" title="Blog" description="Thoughts on early education and parenting from our team, written for the families we serve." />

      <section className="section-container py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg sm:p-8"
            >
              <Badge variant="gold">{post.category}</Badge>
              <h2 className="mt-4 font-display text-xl font-bold sm:text-2xl">{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {post.readTime}
                </span>
                <span>By {post.author}</span>
              </div>
              <LikeCommentSection targetId={post.slug} />
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
