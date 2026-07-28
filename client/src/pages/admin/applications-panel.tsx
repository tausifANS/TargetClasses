import { useState } from 'react';
import { toast } from 'sonner';
import { UserCheck, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePortalApplicationsList, useApprovePortalApplication, useRejectPortalApplication } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { formatDateDMY, matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface Application {
  Id: string;
  SubmittedAt: string;
  StudentName: string;
  DOB: string;
  ClassName: string;
  Subjects: string;
  ParentName: string;
  ParentPhone: string;
  Email: string;
  Address: string;
  Status: string;
}

export function ApplicationsPanel() {
  const { data, isLoading } = usePortalApplicationsList<Application>(true);
  const approve = useApprovePortalApplication();
  const reject = useRejectPortalApplication();
  const [search, setSearch] = useState('');
  const rows = data ?? [];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const handleApprove = async (id: string) => {
    try {
      const res = await approve.mutateAsync(id);
      const emailSent = (res as { data?: { emailSent?: boolean; studentId?: string } })?.data;
      toast.success(`Approved — Student ID ${emailSent?.studentId}`, {
        description: emailSent?.emailSent ? 'Login details emailed to the applicant.' : 'Email not sent (SMTP not configured) — share the credentials manually.',
      });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync(id);
      toast.success('Application rejected');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <UserCheck className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Student Portal Applications</h2>
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search applications…" />

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No applications yet.</p>}
      {!isLoading && rows.length > 0 && filtered.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No matches for "{search}".</p>}

      <div className="mt-5 space-y-3">
        {[...filtered].reverse().map((app) => (
          <div key={app.Id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 text-sm">
                <p className="font-display font-semibold">{app.StudentName} <span className="font-normal text-muted-foreground">— Class {app.ClassName}</span></p>
                <p className="text-muted-foreground">DOB: {formatDateDMY(app.DOB)} &middot; Subjects: {app.Subjects || '—'}</p>
                <p className="text-muted-foreground">Parent: {app.ParentName} &middot; {app.ParentPhone}</p>
                <p className="text-muted-foreground">Email: {app.Email}</p>
                <p className="text-muted-foreground">Address: {app.Address}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={app.Status === 'Approved' ? 'default' : app.Status === 'Rejected' ? 'muted' : 'gold'}>{app.Status}</Badge>
                {app.Status === 'Pending' && (
                  <>
                    <Button size="sm" variant="gold" onClick={() => handleApprove(app.Id)} disabled={approve.isPending}>
                      <Check className="size-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(app.Id)} disabled={reject.isPending}>
                      <X className="size-4" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
