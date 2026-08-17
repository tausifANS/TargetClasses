import { useState } from 'react';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSearchInput } from '@/components/admin/search-input';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { matchesSearch } from '@/lib/utils';
import { COACHING_CLASSES } from '@/constants/site';

interface QuestionRow {
  Id: string;
  SubmittedAt: string;
  Title: string;
  Type: 'mcq' | 'written';
  Options: string;
  Answer: string;
  ClassName: string;
  Subject: string;
  Published: boolean | string;
}

const Subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];

export function QuestionsPanel() {
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'mcq' | 'written'>('mcq');
  const [options, setOptions] = useState('');
  const [answer, setAnswer] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<QuestionRow>>({});

  const { data, isLoading } = useAdminList<QuestionRow>('questions', '/admin/questions');
  const create = useAdminCreate('questions', '/admin/questions');
  const update = useAdminUpdate('questions', '/admin/questions');
  const remove = useAdminDelete('questions', '/admin/questions');

  const filtered = (data ?? []).filter(r => matchesSearch(r, search));

  const handleCreate = () => {
    if (!title || !className) { toast.error('Title and class are required'); return; }
    create.mutate({ title, type, options, answer, className, subject }, {
      onSuccess: () => { toast.success('Question created'); setTitle(''); setOptions(''); setAnswer(''); setClassName(''); setSubject(''); },
      onError: () => toast.error('Failed to create'),
    });
  };

  const handleUpdate = (id: string) => {
    update.mutate({ id, patch: editFields }, {
      onSuccess: () => { toast.success('Updated'); setEditingId(null); setEditFields({}); },
      onError: () => toast.error('Failed to update'),
    });
  };

  const togglePublished = (row: QuestionRow) => {
    update.mutate({ id: row.Id, patch: { Published: row.Published !== true && row.Published !== 'true' } }, {
      onSuccess: () => toast.success('Updated'),
    });
  };

  const subjects = (
    <div className="flex flex-wrap gap-2">
      {Subjects.map(s => (
        <button key={s} onClick={() => setSubject(s)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${subject === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>{s}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Questions (MCQ & Written)</h2>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search questions…" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Create MCQ or written questions for students by class and subject.</p>

      {/* Create Form */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Question title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={className} onChange={e => setClassName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select class</option>
            {COACHING_CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setType('mcq')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${type === 'mcq' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>MCQ</button>
          <button onClick={() => setType('written')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${type === 'written' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Written</button>
        </div>
        {type === 'mcq' && <textarea value={options} onChange={e => setOptions(e.target.value)} placeholder="Options (one per line: A. Option1&#10;B. Option2&#10;C. Option3&#10;D. Option4)" rows={4} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />}
        <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder={type === 'mcq' ? 'Correct answer (e.g. A)' : 'Model answer (optional)'} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Subject:</p>
          {subjects}
        </div>
        <Button onClick={handleCreate} size="sm" variant="gold" disabled={create.isPending}>
          <Plus className="size-4" /> {create.isPending ? 'Creating…' : 'Add Question'}
        </Button>
      </div>

      {/* Questions List */}
      <div className="mt-5 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No questions yet.</p>}
        {filtered.map((q) => (
          <div key={q.Id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                {editingId === q.Id ? (
                  <div className="space-y-2">
                    <input value={editFields.Title ?? q.Title} onChange={e => setEditFields(p => ({ ...p, Title: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                    <div className="flex gap-2">
                      <Badge variant={q.Type === 'mcq' ? 'default' : 'muted'}>{q.Type.toUpperCase()}</Badge>
                      <span className="text-xs text-muted-foreground">Class {q.ClassName}</span>
                      {q.Subject && <span className="text-xs text-muted-foreground">• {q.Subject}</span>}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-display font-semibold">{q.Title}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={q.Type === 'mcq' ? 'default' : 'muted'}>{q.Type.toUpperCase()}</Badge>
                      <span className="text-xs text-muted-foreground">Class {q.ClassName}</span>
                      {q.Subject && <span className="text-xs text-muted-foreground">• {q.Subject}</span>}
                      {q.Answer && <span className="text-xs text-muted-foreground">Answer: {q.Answer}</span>}
                    </div>
                    {q.Options && <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-secondary/50 p-2 text-xs">{q.Options}</pre>}
                  </>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={q.Published ? 'default' : 'muted'} className="cursor-pointer" onClick={() => togglePublished(q)}>
                  {q.Published ? 'Published' : 'Draft'}
                </Badge>
                {editingId === q.Id ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => handleUpdate(q.Id)}><Save className="size-4 text-green-600" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(null); setEditFields({}); }}><X className="size-4" /></Button>
                  </>
                ) : (
                  <Button size="icon" variant="ghost" onClick={() => { setEditingId(q.Id); setEditFields({}); }}><Edit className="size-4" /></Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete this question?')) remove.mutate(q.Id); }}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
