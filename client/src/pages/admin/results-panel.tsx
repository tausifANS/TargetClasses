import { useEffect, useState } from 'react';
import { useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete, useAdminMe } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AdminSearchInput } from '@/components/admin/search-input';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { matchesSearch } from '@/lib/utils';
import { COACHING_CLASSES } from '@/constants/site';

interface ResultRow { Id: string; ExamName: string; ClassName: string; Subject: string; ExamDate: string; Description: string; PdfUrl: string; Published: boolean | string; }

const Subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];

export function ResultsPanel() {
  const [search, setSearch] = useState('');
  const [examName, setExamName] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

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
    if (!examName || !className) { toast.error('Exam name and class required'); return; }
    create.mutate({ examName, className, subject, examDate, description, pdfUrl }, {
      onSuccess: () => { toast.success('Result published'); setExamName(''); setExamDate(''); setDescription(''); setPdfUrl(''); },
      onError: () => toast.error('Failed'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Results</h2>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search results…" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Publish exam results (with an optional PDF) for a class.</p>

      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Exam name (e.g. Mid-Term)" />
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
          <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} placeholder="Exam date" />
        </div>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
        <Input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="Result PDF / Google Drive link (optional)" />
        <Button onClick={handleCreate} size="sm" variant="gold" disabled={create.isPending}>
          <Plus className="size-4" /> Publish Result
        </Button>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No results published yet.</p>}
        {!isLoading && filtered.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.Id}>
                  <TableCell className="font-medium">{r.ExamName}</TableCell>
                  <TableCell>{r.ClassName}</TableCell>
                  <TableCell>{r.Subject}</TableCell>
                  <TableCell>{r.ExamDate}</TableCell>
                  <TableCell>
                    {r.PdfUrl ? (
                      <a href={r.PdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                        <ExternalLink className="size-3" /> Open
                      </a>
                    ) : '—'}
                  </TableCell>
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
