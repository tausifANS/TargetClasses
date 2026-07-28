import { useState } from 'react';
import { toast } from 'sonner';
import { Inbox } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INBOX_SHEETS, useInboxList, useInboxUpdateStatus } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { formatDateDMY, looksLikeDateField, matchesSearch } from '@/lib/utils';
import { AdminSearchInput } from '@/components/admin/search-input';

interface InboxRow {
  Id: string;
  SubmittedAt: string;
  Status: string;
  [key: string]: unknown;
}

const STATUS_OPTIONS = ['New', 'Contacted', 'Resolved', 'Closed'];

function InboxTable({ sheet }: { sheet: string }) {
  const { data, isLoading } = useInboxList(sheet, true);
  const { mutateAsync } = useInboxUpdateStatus(sheet);
  const [search, setSearch] = useState('');
  const rows = (data ?? []) as InboxRow[];
  const filtered = rows.filter((r) => matchesSearch(r, search));

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await mutateAsync({ id, status });
      toast.success('Status updated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search this inbox…" />
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No matches for "{search}".</p>
      ) : (
      <div className="mt-4 space-y-3">
      {[...filtered].reverse().map((row) => (
        <div key={row.Id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1 text-sm">
              {Object.entries(row)
                .filter(([k]) => !['Id', 'SubmittedAt', 'Status'].includes(k))
                .map(([k, v]) => (
                  <p key={k}>
                    <span className="font-medium text-foreground">{k}:</span>{' '}
                    <span className="text-muted-foreground">
                      {looksLikeDateField(k) ? formatDateDMY(v as string) : String(v ?? '') || '—'}
                    </span>
                  </p>
                ))}
              <p className="text-xs text-muted-foreground">
                {row.SubmittedAt ? formatDateDMY(row.SubmittedAt) : ''}
              </p>
            </div>
            <Select value={row.Status || 'New'} onValueChange={(v) => handleStatusChange(row.Id, v)}>
              <SelectTrigger size="sm" className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}

export function InboxPanel() {
  const [active, setActive] = useState<string>(INBOX_SHEETS[0].key);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Inbox className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Inbox</h2>
      </div>
      <Tabs value={active} onValueChange={setActive} className="mt-5">
        <TabsList className="flex h-auto w-fit flex-wrap gap-1 bg-secondary/60 p-1.5">
          {INBOX_SHEETS.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="rounded-full px-3.5 py-1.5 text-sm">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {INBOX_SHEETS.map((s) => (
          <TabsContent key={s.key} value={s.key} className="mt-5">
            <InboxTable sheet={s.key} />
          </TabsContent>
        ))}
      </Tabs>
      <Badge variant="muted" className="mt-4">Tip: statuses are just labels for your own tracking — nothing else depends on them.</Badge>
    </div>
  );
}
