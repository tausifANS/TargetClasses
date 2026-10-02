import { useEffect, useMemo, useState } from 'react';
import { Users, Clock, Camera, Filter, KeyRound, Eye, EyeOff, Copy, Check, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, addMonths, subMonths, parseISO,
} from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useStudentsList, useAttendanceList, useResetStudentPassword } from '@/hooks/use-admin';
import { formatDateDMY, formatDateTimeDMY, matchesSearch, cn } from '@/lib/utils';
import { apiErrorMessage } from '@/lib/api';
import { AdminSearchInput } from '@/components/admin/search-input';
import { COACHING_CLASSES } from '@/constants/site';

function generateReadablePassword() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6);
}

function ResetPasswordDialog({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const { mutateAsync, isPending } = useResetStudentPassword();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [result, setResult] = useState<{ password: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setPassword('');
    setShowPassword(false);
    setSendEmail(true);
    setResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!student) return;
    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const data = await mutateAsync({ studentId: student.StudentId, password: password || undefined, sendEmail: sendEmail && !!student.Email });
      setResult(data);
    } catch (err) {
      toast.error('Could not set password', { description: apiErrorMessage(err) });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <KeyRound className="size-5 text-gold" /> {student?.StudentName}'s Password
        </DialogTitle>

        {result ? (
          <div className="mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              {result.emailSent
                ? `Emailed to ${student?.Email}.`
                : student?.Email
                  ? "Not emailed — share this password with the student directly."
                  : 'No email on file — share this password with the student directly.'}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
              <code className="flex-1 font-mono text-sm">{result.password}</code>
              <button type="button" onClick={handleCopy} className="text-muted-foreground hover:text-foreground" aria-label="Copy password">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>
            <Button variant="gold" className="w-full" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newStudentPassword">New Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="newStudentPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Leave blank to auto-generate"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={() => { setPassword(generateReadablePassword()); setShowPassword(true); }}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Leave blank to auto-generate a random password, or type one yourself.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} disabled={!student?.Email} />
              Email this to the student{!student?.Email && ' (no email on file)'}
            </label>
            <Button variant="gold" className="w-full" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Setting…' : 'Set Password'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface Student {
  Id: string;
  SubmittedAt: string;
  StudentId: string;
  StudentName: string;
  ClassName: string;
  Email: string;
  ParentPhone: string;
  Status: string;
}

interface AttendanceRow {
  Id: string;
  StudentId: string;
  StudentName: string;
  ClassName?: string;
  Date: string;
  PunchIn?: string;
  PunchOut?: string;
  PhotoUrl?: string;
}

function punchTime(value?: string) {
  return value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
}

function DayDetailDialog({ record, studentName, onClose }: { record: AttendanceRow | null; studentName: string; onClose: () => void }) {
  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle>{studentName} — {record ? formatDateDMY(record.Date) : ''}</DialogTitle>
        <DialogDescription className="sr-only">Attendance detail for this day</DialogDescription>
        {record?.PhotoUrl ? (
          <img src={record.PhotoUrl} alt="Punch-in verification" className="w-full rounded-xl" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Camera className="size-8" />
          </div>
        )}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-muted-foreground">Punch In: <span className="font-medium text-foreground">{punchTime(record?.PunchIn)}</span></span>
          <span className="text-muted-foreground">Punch Out: <span className="font-medium text-foreground">{punchTime(record?.PunchOut)}</span></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentCalendarDialog({
  student, rows, onClose,
}: { student: { id: string; name: string } | null; rows: AttendanceRow[]; onClose: () => void }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<AttendanceRow | null>(null);

  const studentRows = useMemo(
    () => rows.filter((r) => r.StudentId === student?.id).sort((a, b) => (a.Date < b.Date ? 1 : -1)),
    [rows, student?.id]
  );
  const byDate = useMemo(() => new Map(studentRows.map((r) => [r.Date, r])), [studentRows]);

  // Land on the month of the student's most recent record, not necessarily the current month.
  useEffect(() => {
    if (student && studentRows[0]?.Date) setMonth(parseISO(studentRows[0].Date));
    else if (student) setMonth(new Date());
  }, [student, studentRows]);

  if (!student) return null;

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <>
      <Dialog open={!!student} onOpenChange={(open) => { if (!open) { onClose(); setSelectedDay(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-gold" /> {student.name}'s Attendance
          </DialogTitle>
          <DialogDescription className="sr-only">Monthly attendance calendar for {student.name}</DialogDescription>

          <div className="flex items-center justify-between">
            <Button size="icon" variant="ghost" onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <p className="font-display text-sm font-semibold">{format(month, 'MMMM yyyy')}</p>
            <Button size="icon" variant="ghost" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const record = byDate.get(dateKey);
              const inMonth = isSameMonth(day, month);
              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!record}
                  onClick={() => record && setSelectedDay(record)}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors',
                    !inMonth && 'text-muted-foreground/30',
                    inMonth && !record && 'text-muted-foreground',
                    record && 'cursor-pointer bg-primary/10 font-semibold text-primary hover:bg-primary/20',
                    isToday(day) && 'ring-1 ring-gold'
                  )}
                >
                  {format(day, 'd')}
                  {record && <span className="absolute bottom-1 size-1 rounded-full bg-gold" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary/40" /> Present day — click for details</span>
            <span>{studentRows.length} day{studentRows.length === 1 ? '' : 's'} total</span>
          </div>
        </DialogContent>
      </Dialog>

      <DayDetailDialog record={selectedDay} studentName={student.name} onClose={() => setSelectedDay(null)} />
    </>
  );
}

export function StudentsPanel() {
  const { data, isLoading } = useStudentsList<Student>(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [resetTarget, setResetTarget] = useState<Student | null>(null);
  const rows = data ?? [];
  const filtered = rows
    .filter((r) => matchesSearch(r, search))
    .filter((r) => filterClass === 'all' || r.ClassName === filterClass);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Users className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Enrolled Students</h2>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex-1">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search students…" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="size-3.5" /> Class:</div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="h-9 w-full text-xs sm:h-8 sm:w-auto sm:min-w-[130px]"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {COACHING_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No students enrolled yet — approve a Portal Application to create one.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches.</p>}

      <div className="mt-5">
        {filtered.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Parent Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.Id}>
                  <TableCell className="font-medium">{s.StudentId}</TableCell>
                  <TableCell>{s.StudentName}</TableCell>
                  <TableCell>{s.ClassName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.Email}</TableCell>
                  <TableCell className="text-muted-foreground">{s.ParentPhone}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTimeDMY(s.SubmittedAt)}</TableCell>
                  <TableCell><Badge variant={s.Status === 'Active' ? 'default' : 'muted'}>{s.Status}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setResetTarget(s)}>
                      <KeyRound className="size-3.5" /> Resend / Reset
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ResetPasswordDialog student={resetTarget} onClose={() => setResetTarget(null)} />
    </div>
  );
}

export function AttendancePanel() {
  const { data, isLoading } = useAttendanceList<AttendanceRow>(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [preview, setPreview] = useState<AttendanceRow | null>(null);
  const [calendarStudent, setCalendarStudent] = useState<{ id: string; name: string } | null>(null);
  const rows = data ?? [];
  const filtered = rows
    .filter((r) => matchesSearch(r, search))
    .filter((r) => filterClass === 'all' || r.ClassName === filterClass);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Clock className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Attendance</h2>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex-1">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search attendance…" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="size-3.5" /> Class:</div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="h-9 w-full text-xs sm:h-8 sm:w-auto sm:min-w-[130px]"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {COACHING_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Click a student's name to see their full attendance calendar.</p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No attendance recorded yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches.</p>}

      <div className="mt-5">
        {filtered.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Punch In</TableHead>
                <TableHead>Punch Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.Id}>
                  <TableCell>
                    {r.PhotoUrl ? (
                      <button type="button" onClick={() => setPreview(r)} className="block overflow-hidden rounded-lg ring-1 ring-border transition-opacity hover:opacity-80">
                        <img src={r.PhotoUrl} alt={`${r.StudentName || r.StudentId} punch-in verification`} className="size-10 object-cover" />
                      </button>
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <Camera className="size-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setCalendarStudent({ id: r.StudentId, name: r.StudentName || r.StudentId })}
                      className="font-medium text-foreground underline-offset-2 hover:text-gold hover:underline"
                    >
                      {r.StudentName || r.StudentId}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.ClassName ?? '—'}</TableCell>
                  <TableCell>{formatDateDMY(r.Date)}</TableCell>
                  <TableCell className="text-muted-foreground">{punchTime(r.PunchIn)}</TableCell>
                  <TableCell className="text-muted-foreground">{punchTime(r.PunchOut)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DayDetailDialog record={preview} studentName={preview?.StudentName || preview?.StudentId || ''} onClose={() => setPreview(null)} />
      <StudentCalendarDialog student={calendarStudent} rows={rows} onClose={() => setCalendarStudent(null)} />
    </div>
  );
}
