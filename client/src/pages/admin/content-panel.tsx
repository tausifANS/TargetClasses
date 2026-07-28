import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Trash2, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { formatDateDMY, looksLikeDateField, matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface Row {
  Id: string;
  Published?: boolean | string;
  [key: string]: unknown;
}

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';

// ---- Notices & Events & Toppers: simple create form + publish toggle + delete ----

function SimpleContentSection({
  sheetKey,
  path,
  fields,
  displayFields,
}: {
  sheetKey: string;
  path: string;
  fields: { name: string; label: string; type?: 'text' | 'textarea' | 'date' }[];
  displayFields: string[];
}) {
  const { data, isLoading } = useAdminList<Row>(sheetKey, path, true);
  const create = useAdminCreate(sheetKey, path);
  const update = useAdminUpdate(sheetKey, path);
  const remove = useAdminDelete(sheetKey, path);
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const rows = data ?? [];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const handleCreate = async () => {
    if (fields.some((f) => !form[f.name]?.trim())) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await create.mutateAsync(form);
      setForm({});
      toast.success('Added');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const togglePublished = async (row: Row) => {
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
      <div className="grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-2">
        {fields.map((f) =>
          f.type === 'textarea' ? (
            <Textarea
              key={f.name}
              placeholder={f.label}
              className="sm:col-span-2"
              value={form[f.name] ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
            />
          ) : (
            <Input
              key={f.name}
              type={f.type === 'date' ? 'date' : 'text'}
              placeholder={f.label}
              value={form[f.name] ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
            />
          )
        )}
        <Button variant="gold" size="sm" className="sm:col-span-2 w-fit" onClick={handleCreate} disabled={create.isPending}>
          Add
        </Button>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Nothing here yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 space-y-3">
        {[...filtered].reverse().map((row) => (
          <div key={row.Id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1 space-y-0.5 text-sm">
              {displayFields.map((f) => (
                <p key={f} className={f === displayFields[0] ? 'font-display font-semibold' : 'text-muted-foreground'}>
                  {looksLikeDateField(f) ? formatDateDMY(row[f]) : String(row[f] ?? '')}
                </p>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant={truthy(row.Published) ? 'default' : 'muted'}
                className="cursor-pointer"
                onClick={() => togglePublished(row)}
              >
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

// ---- Testimonials: moderation only (publish toggle, no create/delete) ----

function TestimonialsSection() {
  const { data, isLoading } = useAdminList<Row>('testimonials', '/admin/testimonials', true);
  const update = useAdminUpdate('testimonials', '/admin/testimonials');
  const [search, setSearch] = useState('');
  const rows = data ?? [];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const togglePublished = async (row: Row) => {
    try {
      await update.mutateAsync({ id: row.Id, patch: { Published: !truthy(row.Published) } });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (isLoading) return <p className="mt-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search testimonials…" />
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No testimonials submitted yet.</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>
      ) : (
      <div className="mt-4 space-y-3">
      {[...filtered].reverse().map((row) => (
        <div key={row.Id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="flex items-center gap-1 font-display font-semibold">
              {String(row.ParentName ?? '')} {Boolean(row.Rating) && <span className="flex items-center gap-0.5 text-gold"><Star className="size-3.5 fill-gold" /> {String(row.Rating)}</span>}
            </p>
            <p className="text-muted-foreground">{String(row.Message ?? '')}</p>
          </div>
          <Badge variant={truthy(row.Published) ? 'default' : 'muted'} className="shrink-0 cursor-pointer" onClick={() => togglePublished(row)}>
            {truthy(row.Published) ? 'Published' : 'Draft — click to publish'}
          </Badge>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}

export function ContentPanel() {
  const [active, setActive] = useState('notices');

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <FileText className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Content</h2>
      </div>
      <Tabs value={active} onValueChange={setActive} className="mt-5">
        <TabsList className="flex h-auto w-fit flex-wrap gap-1 bg-secondary/60 p-1.5">
          <TabsTrigger value="notices" className="rounded-full px-3.5 py-1.5 text-sm">Notices</TabsTrigger>
          <TabsTrigger value="events" className="rounded-full px-3.5 py-1.5 text-sm">Events</TabsTrigger>
          <TabsTrigger value="toppers" className="rounded-full px-3.5 py-1.5 text-sm">Toppers</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-full px-3.5 py-1.5 text-sm">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="mt-5">
          <SimpleContentSection
            sheetKey="notices"
            path="/admin/notices"
            fields={[{ name: 'Title', label: 'Title' }, { name: 'Body', label: 'Body', type: 'textarea' }]}
            displayFields={['Title', 'Body']}
          />
        </TabsContent>
        <TabsContent value="events" className="mt-5">
          <SimpleContentSection
            sheetKey="events"
            path="/admin/events"
            fields={[
              { name: 'Title', label: 'Title' },
              { name: 'EventDate', label: 'Date', type: 'date' },
              { name: 'Description', label: 'Description', type: 'textarea' },
            ]}
            displayFields={['Title', 'EventDate', 'Description']}
          />
        </TabsContent>
        <TabsContent value="toppers" className="mt-5">
          <SimpleContentSection
            sheetKey="toppers"
            path="/admin/toppers"
            fields={[
              { name: 'StudentName', label: 'Student Name' },
              { name: 'ClassName', label: 'Class' },
              { name: 'Achievement', label: 'Achievement' },
              { name: 'Year', label: 'Year' },
            ]}
            displayFields={['StudentName', 'ClassName', 'Achievement', 'Year']}
          />
        </TabsContent>
        <TabsContent value="testimonials" className="mt-5">
          <TestimonialsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
