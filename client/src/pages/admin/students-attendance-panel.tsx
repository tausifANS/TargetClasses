import { useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        {filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Parent Phone</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.Id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{s.StudentId}</td>
                  <td className="px-4 py-3">{s.StudentName}</td>
                  <td className="px-4 py-3">{s.ClassName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.Email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.ParentPhone}</td>
                  <td className="px-4 py-3"><Badge variant={s.Status === 'Active' ? 'default' : 'muted'}>{s.Status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function AttendancePanel() {
  const { data, isLoading } = useAttendanceList<AttendanceRow>(true);
  const [search, setSearch] = useState('');
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

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        {filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.Id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.StudentName || r.StudentId}</td>
                  <td className="px-4 py-3">{formatDateDMY(r.Date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.PunchIn ? new Date(r.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.PunchOut ? new Date(r.PunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
