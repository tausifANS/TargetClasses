import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Megaphone, Trash2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface PostRow {
  Id: string;
  Title: string;
  Body: string;
  ImageUrl?: string;
  Highlighted?: boolean | string;
  Published?: boolean | string;
}

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';

export function PostsPanel() {
  const { data, isLoading } = useAdminList<PostRow>('posts', '/admin/posts', true);
  const create = useAdminCreate('posts', '/admin/posts');
  const update = useAdminUpdate('posts', '/admin/posts');
  const remove = useAdminDelete('posts', '/admin/posts');
  const rows = data ?? [];
  const [search, setSearch] = useState('');
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [highlighted, setHighlighted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!title || !body) {
      toast.error('Title and body are required');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('highlighted', String(highlighted));
    if (fileRef.current?.files?.[0]) formData.append('image', fileRef.current.files[0]);

    try {
      await create.mutateAsync(formData);
      setTitle('');
      setBody('');
      setHighlighted(false);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Post published');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const toggle = async (row: PostRow, field: 'Highlighted' | 'Published') => {
    const fd = new FormData();
    fd.append(field.toLowerCase(), String(!truthy(row[field])));
    try {
      await update.mutateAsync({ id: row.Id, patch: fd });
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
        <Megaphone className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Posts</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Posts marked "Highlighted" get featured styling on the homepage.</p>

      <div className="mt-5 space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="What's the announcement?" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex flex-wrap items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} />
            Highlight this post
          </label>
        </div>
        <Button variant="gold" size="sm" onClick={handleCreate} disabled={create.isPending}>
          Publish Post
        </Button>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search posts…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No posts yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[...filtered].reverse().map((row) => (
          <div key={row.Id} className="overflow-hidden rounded-xl border border-border bg-card">
            {row.ImageUrl && <img src={row.ImageUrl} alt={row.Title} className="aspect-video w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-semibold">{row.Title}</p>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(row.Id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{row.Body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={truthy(row.Published) ? 'default' : 'muted'} className="cursor-pointer" onClick={() => toggle(row, 'Published')}>
                  {truthy(row.Published) ? 'Published' : 'Draft — click to publish'}
                </Badge>
                <Badge variant={truthy(row.Highlighted) ? 'gold' : 'outline'} className="cursor-pointer" onClick={() => toggle(row, 'Highlighted')}>
                  <Star className="size-3" /> {truthy(row.Highlighted) ? 'Highlighted' : 'Highlight it'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
