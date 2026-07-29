import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHero } from '@/components/layout/page-hero';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, GALLERY_VIDEOS, type GalleryItem } from '@/data/gallery';
import { useGalleryItems } from '@/hooks/use-content';
import { resolveMediaUrl } from '@/lib/api';

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
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
            <img src={active.src} alt={active.caption} className="max-h-[85vh] w-full rounded-2xl object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
