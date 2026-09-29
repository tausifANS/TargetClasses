import { useEffect, useState } from 'react';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete, useAdminMe } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
  const { data: me } = useAdminMe(true);
  const isTeacher = me?.accountRole === 'teacher';

  const filtered = (data ?? []).filter(r => matchesSearch(r, search));

  useEffect(() => {
    if (isTeacher && me?.className) setClassName(me.className);
  }, [isTeacher, me?.className]);

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
          <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student name" />
          <Select value={className} onValueChange={setClassName} disabled={isTeacher}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {COACHING_CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {Subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Exam name (e.g. Mid-Term)" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={marks} onChange={e => setMarks(e.target.value)} placeholder="Marks obtained" />
          <Input value={totalMarks} onChange={e => setTotalMarks(e.target.value)} placeholder="Total marks" />
          <Input value={term} onChange={e => setTerm(e.target.value)} placeholder="Term (e.g. First Half)" />
        </div>
        <Button onClick={handleCreate} size="sm" variant="gold" disabled={create.isPending}>
          <Plus className="size-4" /> Upload Result
        </Button>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No results uploaded yet.</p>}
        {!isLoading && filtered.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.Id}>
                  <TableCell className="font-medium">{r.StudentName}</TableCell>
                  <TableCell>{r.ClassName}</TableCell>
                  <TableCell>{r.Subject}</TableCell>
                  <TableCell>{r.ExamName}</TableCell>
                  <TableCell>{r.Marks}/{r.TotalMarks}</TableCell>
                  <TableCell><Badge variant={r.Published ? 'default' : 'muted'} className="cursor-pointer" onClick={() => update.mutate({ id: r.Id, patch: { Published: r.Published !== true && r.Published !== 'true' } })}>{r.Published ? 'Published' : 'Draft'}</Badge></TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) remove.mutate(r.Id); }}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
