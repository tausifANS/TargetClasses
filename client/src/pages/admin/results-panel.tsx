import { useState } from 'react';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSearchInput } from '@/components/admin/search-input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { matchesSearch } from '@/lib/utils';
import { COACHING_CLASSES } from '@/constants/site';

interface ResultRow { Id: string; StudentName: string; ClassName: string; Subject: string; Marks: string; TotalMarks: string; ExamName: string; Term: string; Published: boolean | string; }

const Subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];

export function ResultsPanel() {
  const [search, setSearch] = useState('');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [examName, setExamName] = useState('');
  const [term, setTerm] = useState('');

  const { data, isLoading } = useAdminList<ResultRow>('results', '/admin/results');
  const create = useAdminCreate('results', '/admin/results');
  const update = useAdminUpdate('results', '/admin/results');
  const remove = useAdminDelete('results', '/admin/results');

  const filtered = (data ?? []).filter(r => matchesSearch(r, search));

  const handleCreate = () => {
    if (!studentName || !className) { toast.error('Student name and class required'); return; }
    create.mutate({ studentName, className, subject, marks, totalMarks, examName, term }, {
      onSuccess: () => { toast.success('Result uploaded'); setStudentName(''); setMarks(''); setTotalMarks(''); setExamName(''); },
      onError: () => toast.error('Failed'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Results</h2>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search results…" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Upload student results for specific classes.</p>

      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={className} onChange={e => setClassName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select class</option>
            {COACHING_CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={subject} onChange={e => setSubject(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select subject</option>
            {Subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Exam name (e.g. Mid-Term)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={marks} onChange={e => setMarks(e.target.value)} placeholder="Marks obtained" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={totalMarks} onChange={e => setTotalMarks(e.target.value)} placeholder="Total marks" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Term (e.g. First Half)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <Button onClick={handleCreate} size="sm" variant="gold" disabled={create.isPending}>
          <Plus className="size-4" /> Upload Result
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No results uploaded yet.</p>}
        {!isLoading && filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Exam</th><th className="px-3 py-2">Marks</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.Id} className="border-b">
                  <td className="px-3 py-2 font-medium">{r.StudentName}</td>
                  <td className="px-3 py-2">{r.ClassName}</td>
                  <td className="px-3 py-2">{r.Subject}</td>
                  <td className="px-3 py-2">{r.ExamName}</td>
                  <td className="px-3 py-2">{r.Marks}/{r.TotalMarks}</td>
                  <td className="px-3 py-2"><Badge variant={r.Published ? 'default' : 'muted'} className="cursor-pointer" onClick={() => update.mutate({ id: r.Id, patch: { Published: r.Published !== true && r.Published !== 'true' } })}>{r.Published ? 'Published' : 'Draft'}</Badge></td>
                  <td className="px-3 py-2"><Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) remove.mutate(r.Id); }}><Trash2 className="size-4 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
