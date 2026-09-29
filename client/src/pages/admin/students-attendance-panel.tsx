import { useState } from 'react';
import { Users, Clock, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useStudentsList, useAttendanceList } from '@/hooks/use-admin';
import { formatDateDMY, matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface Student {
  Id: string;
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
  Date: string;
  PunchIn?: string;
  PunchOut?: string;
  PhotoUrl?: string;
}

export function StudentsPanel() {
  const { data, isLoading } = useStudentsList<Student>(true);
  const [search, setSearch] = useState('');
  const rows = data ?? [];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Users className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Enrolled Students</h2>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search students…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No students enrolled yet — approve a Portal Application to create one.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

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
                <TableHead>Status</TableHead>
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
                  <TableCell><Badge variant={s.Status === 'Active' ? 'default' : 'muted'}>{s.Status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export function AttendancePanel() {
  const { data, isLoading } = useAttendanceList<AttendanceRow>(true);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<AttendanceRow | null>(null);
  const rows = data ?? [];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Clock className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Attendance</h2>
      </div>

      <div className="mt-5">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search attendance…" />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No attendance recorded yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5">
        {filtered.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Student</TableHead>
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
                  <TableCell className="font-medium">{r.StudentName || r.StudentId}</TableCell>
                  <TableCell>{formatDateDMY(r.Date)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.PunchIn ? new Date(r.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{r.PunchOut ? new Date(r.PunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle>{preview?.StudentName || preview?.StudentId} — {preview ? formatDateDMY(preview.Date) : ''}</DialogTitle>
          {preview?.PhotoUrl && <img src={preview.PhotoUrl} alt="Punch-in verification" className="w-full rounded-xl" />}
          <p className="text-center text-xs text-muted-foreground">
            Punched in at {preview?.PunchIn ? new Date(preview.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
