import { useState } from 'react';
import { toast } from 'sonner';
import { Video, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';
import { COACHING_CLASSES } from '@/constants/site';

interface ClassRow {
  Id: string;
  Title: string;
  Subject: string;
  ClassName: string;
  Type: string;
  Url: string;
  Published?: boolean | string;
}

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];

export function ClassesPanel() {
  const { data, isLoading } = useAdminList<ClassRow>('classes', '/admin/classes', true);
  const create = useAdminCreate('classes', '/admin/classes');
  const update = useAdminUpdate('classes', '/admin/classes');
  const remove = useAdminDelete('classes', '/admin/classes');
  const rows = data ?? [];

  const [form, setForm] = useState({ Title: '', Subject: '', ClassName: '', Type: 'Live', Url: '' });
  const [search, setSearch] = useState('');
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const handleCreate = async () => {
    if (!form.Title || !form.Subject || !form.ClassName || !form.Url) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await create.mutateAsync(form);
      setForm({ Title: '', Subject: '', ClassName: '', Type: 'Live', Url: '' });
      toast.success('Class added');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const togglePublished = async (row: ClassRow) => {
    try {
      await update.mutateAsync({ id: row.Id, patch: { Published: !truthy(row.Published) } });
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
        <Video className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Classes</h2>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-2">
        <Input placeholder="Title" value={form.Title} onChange={(e) => setForm((s) => ({ ...s, Title: e.target.value }))} />
        <Select value={form.Subject} onValueChange={(v) => setForm((s) => ({ ...s, Subject: v }))}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={form.ClassName} onValueChange={(v) => setForm((s) => ({ ...s, ClassName: v }))}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>{COACHING_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={form.Type} onValueChange={(v) => setForm((s) => ({ ...s, Type: v }))}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Live">Live</SelectItem>
            <SelectItem value="Recorded">Recorded</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Link (Zoom / YouTube / Meet URL)" className="sm:col-span-2" value={form.Url} onChange={(e) => setForm((s) => ({ ...s, Url: e.target.value }))} />
        <Button variant="gold" size="sm" className="w-fit sm:col-span-2" onClick={handleCreate} disabled={create.isPending}>
          Add Class
        </Button>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search classes…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No classes posted yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 space-y-3">
        {[...filtered].reverse().map((row) => (
          <div key={row.Id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1 space-y-0.5 text-sm">
              <p className="font-display font-semibold">{row.Title}</p>
              <p className="text-muted-foreground">{row.Subject} &middot; Class {row.ClassName} &middot; {row.Type}</p>
              <a href={row.Url} target="_blank" rel="noreferrer" className="text-gold hover:underline">{row.Url}</a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={truthy(row.Published) ? 'default' : 'muted'} className="cursor-pointer" onClick={() => togglePublished(row)}>
                {truthy(row.Published) ? 'Published' : 'Draft — click to publish'}
              </Badge>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(row.Id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
