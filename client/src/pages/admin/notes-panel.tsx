import { useState } from 'react';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSearchInput } from '@/components/admin/search-input';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { matchesSearch } from '@/lib/utils';
import { COACHING_CLASSES } from '@/constants/site';

interface NoteRow { Id: string; Title: string; ClassName: string; Subject: string; FileUrl: string; Published: boolean | string; }

const Subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];

export function NotesPanel() {
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const { data, isLoading } = useAdminList<NoteRow>('notes', '/admin/notes');
  const create = useAdminCreate('notes', '/admin/notes');
  const update = useAdminUpdate('notes', '/admin/notes');
  const remove = useAdminDelete('notes', '/admin/notes');

  const filtered = (data ?? []).filter(r => matchesSearch(r, search));

  const handleCreate = () => {
    if (!title || !className || !fileUrl) { toast.error('Title, class and file URL required'); return; }
    create.mutate({ title, className, subject, fileUrl }, {
      onSuccess: () => { toast.success('Note added'); setTitle(''); setFileUrl(''); setClassName(''); setSubject(''); },
      onError: () => toast.error('Failed'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Notes & PDF Sharing</h2>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search notes…" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Share PDF notes with specific classes and subjects.</p>

      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={className} onChange={e => setClassName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select class</option>
            {COACHING_CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select subject</option>
          {Subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="PDF / Google Drive link" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <Button onClick={handleCreate} size="sm" variant="gold" disabled={create.isPending}>
          <Plus className="size-4" /> Share Note
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No notes shared yet.</p>}
        {filtered.map((n) => (
          <div key={n.Id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold">{n.Title}</p>
              <p className="text-xs text-muted-foreground">Class {n.ClassName} • {n.Subject}</p>
              <a href={n.FileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-gold hover:underline">
                <ExternalLink className="size-3" /> Open Note
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={n.Published ? 'default' : 'muted'} className="cursor-pointer" onClick={() => update.mutate({ id: n.Id, patch: { Published: n.Published !== true && n.Published !== 'true' } })}>
                {n.Published ? 'Published' : 'Draft'}
              </Badge>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) remove.mutate(n.Id); }}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
