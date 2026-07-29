import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Users2, Trash2, Pencil, Crown, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { apiErrorMessage, resolveMediaUrl } from '@/lib/api';
import { matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface TeacherRow {
  Id: string;
  Name: string;
  Position: string;
  Subjects: string;
  PhotoUrl?: string;
  Published?: boolean | string;
}

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';
const isDirector = (position: string) => position?.toLowerCase().includes('director');

function EditRow({ row, onDone }: { row: TeacherRow; onDone: () => void }) {
  const update = useAdminUpdate('teachers', '/admin/teachers');
  const [name, setName] = useState(row.Name);
  const [position, setPosition] = useState(row.Position);
  const [subjects, setSubjects] = useState(row.Subjects);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!name || !position) {
      toast.error('Name and position are required');
      return;
    }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('position', position);
    fd.append('subjects', subjects);
    if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);

    try {
      await update.mutateAsync({ id: row.Id, patch: fd });
      toast.success('Updated');
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gold/40 bg-card p-4">
      {row.PhotoUrl && <img src={resolveMediaUrl(row.PhotoUrl)} alt={row.Name} className="size-16 shrink-0 rounded-xl object-cover" />}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Position (e.g. Director, Physics Teacher)" value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>
        <Input placeholder="Subjects (comma separated)" value={subjects} onChange={(e) => setSubjects(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" className="text-xs" />
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <Button size="icon" variant="gold" onClick={handleSave} disabled={update.isPending} aria-label="Save">
          <Check className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDone} aria-label="Cancel">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function TeachersPanel() {
  const { data, isLoading } = useAdminList<TeacherRow>('teachers', '/admin/teachers', true);
  const create = useAdminCreate('teachers', '/admin/teachers');
  const update = useAdminUpdate('teachers', '/admin/teachers');
  const remove = useAdminDelete('teachers', '/admin/teachers');
  const rows = data ?? [];
  const [search, setSearch] = useState('');
  const filtered = rows.filter((r) => matchesSearch(r, search));
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [subjects, setSubjects] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!name || !position || !fileRef.current?.files?.[0]) {
      toast.error('Name, position, and a photo are required');
      return;
    }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('position', position);
    fd.append('subjects', subjects);
    fd.append('image', fileRef.current.files[0]);

    try {
      await create.mutateAsync(fd);
      setName('');
      setPosition('');
      setSubjects('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Team member added');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const togglePublished = async (row: TeacherRow) => {
    const fd = new FormData();
    fd.append('published', String(!truthy(row.Published)));
    try {
      await update.mutateAsync({ id: row.Id, patch: fd });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Removed');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Users2 className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Faculty / Team</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Shown on the public Faculty page and homepage. "Director" in the position gets a crown badge.</p>

      <div className="mt-5 grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-2">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Position (e.g. Director, Physics Teacher)" value={position} onChange={(e) => setPosition(e.target.value)} />
        <Input placeholder="Subjects (comma separated)" className="sm:col-span-2" value={subjects} onChange={(e) => setSubjects(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" className="text-sm sm:col-span-2" />
        <Button variant="gold" size="sm" className="w-fit sm:col-span-2" onClick={handleCreate} disabled={create.isPending}>
          Add Team Member
        </Button>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search team…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No team members added yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 space-y-3">
        {[...filtered].reverse().map((row) =>
          editingId === row.Id ? (
            <EditRow key={row.Id} row={row} onDone={() => setEditingId(null)} />
          ) : (
            <div key={row.Id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                {row.PhotoUrl && <img src={resolveMediaUrl(row.PhotoUrl)} alt={row.Name} className="size-16 shrink-0 rounded-xl object-cover" />}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-display font-semibold">
                    {row.Name}
                    {isDirector(row.Position) && <Crown className="size-3.5 text-gold" />}
                  </p>
                  <p className="text-sm text-muted-foreground">{row.Position}{row.Subjects ? ` · ${row.Subjects}` : ''}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={truthy(row.Published) ? 'default' : 'muted'} className="cursor-pointer" onClick={() => togglePublished(row)}>
                  {truthy(row.Published) ? 'Shown' : 'Hidden — click to show'}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(row.Id)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(row.Id)} aria-label="Delete">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
