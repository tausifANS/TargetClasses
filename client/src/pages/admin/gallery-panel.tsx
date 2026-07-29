import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminList, useAdminCreate, useAdminDelete } from '@/hooks/use-admin';
import { apiErrorMessage, resolveMediaUrl } from '@/lib/api';
import { matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface GalleryRow {
  Id: string;
  Category: string;
  ImageUrl: string;
  Caption?: string;
}

const CATEGORIES = ['classroom', 'events', 'topper', 'general'];

export function GalleryPanel() {
  const { data, isLoading } = useAdminList<GalleryRow>('gallery', '/admin/gallery', true);
  const create = useAdminCreate('gallery', '/admin/gallery');
  const remove = useAdminDelete('gallery', '/admin/gallery');
  const rows = data ?? [];
  const [search, setSearch] = useState('');
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const [category, setCategory] = useState('general');
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!fileRef.current?.files?.[0]) {
      toast.error('Choose an image first');
      return;
    }
    const formData = new FormData();
    formData.append('image', fileRef.current.files[0]);
    formData.append('category', category);
    formData.append('caption', caption);

    try {
      await create.mutateAsync(formData);
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Deleted');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <ImageIcon className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Gallery</h2>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Caption (optional)" className="w-56" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Button variant="gold" size="sm" onClick={handleUpload} disabled={create.isPending}>
          Upload
        </Button>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search gallery…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No photos uploaded yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...filtered].reverse().map((row) => (
          <div key={row.Id} className="group relative overflow-hidden rounded-xl border border-border">
            <img src={resolveMediaUrl(row.ImageUrl)} alt={row.Caption || row.Category} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/0 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button size="icon" variant="ghost" className="ml-auto size-8 text-white hover:bg-white/20 hover:text-white" onClick={() => handleDelete(row.Id)}>
                <Trash2 className="size-4" />
              </Button>
              <p className="truncate text-xs text-white">{row.Caption || row.Category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
