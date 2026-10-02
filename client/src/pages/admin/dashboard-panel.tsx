import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  AreaChart, Area, BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import {
  LayoutDashboard, Users, Inbox, UserCheck, Clock, Users2, Video, Megaphone,
  NotebookText, HelpCircle, Award, Image as ImageIcon, Star, Filter, ArrowRight,
  Bell, Gauge, FileText, CalendarDays, Trophy, MessageSquareHeart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Counter } from '@/components/ui/counter';
import {
  useAdminMe,
  useAdminList,
  useInboxList,
  usePortalApplicationsList,
  useStudentsList,
  useAttendanceList,
} from '@/hooks/use-admin';
import { CLASSES } from '@/constants/site';
import { formatDateDMY } from '@/lib/utils';

// ---- validated dataviz tokens (see dataviz skill — categorical slot 1 / status palette) ----
const SERIES_BLUE = { light: '#2a78d6', dark: '#3987e5' };
const STATUS = { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b', neutral: '#898781' };

const truthy = (v: unknown) => v === true || String(v).toUpperCase() === 'TRUE';
const normStatus = (s: unknown) => (s && String(s).trim() ? String(s) : 'New');

type DateRange = 'today' | '7d' | '30d' | 'all';
const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function rangeStart(range: DateRange): Date | null {
  const now = new Date();
  if (range === 'all') return null;
  if (range === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - (range === '7d' ? 7 : 30));
  return d;
}

function inRange(value: unknown, start: Date | null): boolean {
  if (!start) return true;
  if (!value) return false;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return false;
  return d >= start;
}

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function timeAgo(value: unknown): string {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return '—';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateDMY(value);
}

interface InboxRow {
  Id: string;
  SubmittedAt: string;
  Status: string;
  Name?: string;
  StudentName?: string;
  ParentName?: string;
  [key: string]: unknown;
}

function inboxTitle(sheetKey: string, row: InboxRow): string {
  if (sheetKey === 'Admissions') return String(row.StudentName ?? row.ParentName ?? 'Admission inquiry');
  return String(row.Name ?? 'Submission');
}

interface Student { Id: string; SubmittedAt: string; StudentId: string; StudentName: string; ClassName: string; Status: string; }
interface AttendanceRow { Id: string; StudentId: string; StudentName: string; ClassName?: string; Date: string; PunchIn?: string; PunchOut?: string; }
interface PortalApplication { Id: string; SubmittedAt: string; StudentName: string; ClassName: string; Status: string; }
interface Row { Id: string; Published?: boolean | string; Highlighted?: boolean | string; Rating?: number | string; ClassName?: string; [key: string]: unknown; }

// ---- small building blocks ----

function FilterBar({
  dateRange, onDateRange, filterClass, onFilterClass,
}: { dateRange: DateRange; onDateRange: (v: DateRange) => void; filterClass: string; onFilterClass: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="size-3.5" /> Filters:</div>
      <Select value={dateRange} onValueChange={(v) => onDateRange(v as DateRange)}>
        <SelectTrigger size="sm" className="w-full text-xs sm:w-auto sm:min-w-[140px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filterClass} onValueChange={onFilterClass}>
        <SelectTrigger size="sm" className="w-full text-xs sm:w-auto sm:min-w-[130px]"><SelectValue placeholder="Class" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, suffix = '', sublabel, href,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; suffix?: string; sublabel?: string; href: string }) {
  return (
    <Link to={href} className="group block">
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-4 font-display text-3xl font-bold">
            <Counter value={value} suffix={suffix} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          {sublabel && <p className="mt-0.5 text-xs text-muted-foreground/70">{sublabel}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function StatTile({
  icon: Icon, label, value, total, href,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; total: number; href: string }) {
  return (
    <Link to={href} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground/70 group-hover:bg-gold/15 group-hover:text-gold">
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-lg font-bold leading-none">{total}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}{total > 0 ? ` · ${value} published` : ''}</p>
      </div>
    </Link>
  );
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function tooltipStyle() {
  return {
    contentStyle: { backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--foreground)' },
    labelStyle: { color: 'var(--muted-foreground)', marginBottom: 2 },
    cursor: { stroke: 'var(--border)' },
  };
}

// ---- main panel ----

export function DashboardPanel() {
  const { data: me } = useAdminMe(true);
  const { resolvedTheme } = useTheme();
  const seriesColor = resolvedTheme === 'dark' ? SERIES_BLUE.dark : SERIES_BLUE.light;

  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [filterClass, setFilterClass] = useState('all');

  // Inbox (4 sheets)
  const admissions = useInboxList('Admissions', true);
  const contactMessages = useInboxList('ContactMessages', true);
  const supportRequests = useInboxList('SupportRequests', true);
  const careerApplications = useInboxList('CareerApplications', true);

  // Operations
  const portalApplications = usePortalApplicationsList<PortalApplication>(true);
  const students = useStudentsList<Student>(true);
  const attendance = useAttendanceList<AttendanceRow>(true);
  const teachers = useAdminList<Row>('teachers', '/admin/teachers', true);

  // Content library
  const posts = useAdminList<Row>('posts', '/admin/posts', true);
  const notices = useAdminList<Row>('notices', '/admin/notices', true);
  const events = useAdminList<Row>('events', '/admin/events', true);
  const toppers = useAdminList<Row>('toppers', '/admin/toppers', true);
  const testimonials = useAdminList<Row>('testimonials', '/admin/testimonials', true);
  const gallery = useAdminList<Row>('gallery', '/admin/gallery', true);
  const classes = useAdminList<Row>('classes', '/admin/classes', true);
  const questions = useAdminList<Row>('questions', '/admin/questions', true);
  const notes = useAdminList<Row>('notes', '/admin/notes', true);
  const results = useAdminList<Row>('results', '/admin/results', true);

  const inboxSources = useMemo(
    () => [
      { key: 'Admissions', label: 'Admissions', rows: (admissions.data ?? []) as InboxRow[] },
      { key: 'ContactMessages', label: 'Contact Messages', rows: (contactMessages.data ?? []) as InboxRow[] },
      { key: 'SupportRequests', label: 'Support Requests', rows: (supportRequests.data ?? []) as InboxRow[] },
      { key: 'CareerApplications', label: 'Career Applications', rows: (careerApplications.data ?? []) as InboxRow[] },
    ],
    [admissions.data, contactMessages.data, supportRequests.data, careerApplications.data]
  );

  const start = rangeStart(dateRange);

  const allStudents = students.data ?? [];
  const studentsInScope = filterClass === 'all' ? allStudents : allStudents.filter((s) => s.ClassName === filterClass);
  const activeStudentsInScope = studentsInScope.filter((s) => s.Status === 'Active');

  const allAttendance = attendance.data ?? [];
  const attendanceInScope = filterClass === 'all' ? allAttendance : allAttendance.filter((a) => a.ClassName === filterClass);
  const todayStr = new Date().toISOString().slice(0, 10);
  const presentToday = attendanceInScope.filter((a) => a.Date === todayStr && a.PunchIn).length;
  const attendanceRate = activeStudentsInScope.length > 0 ? Math.round((presentToday / activeStudentsInScope.length) * 100) : 0;

  const pendingApplications = (portalApplications.data ?? []).filter((a) => normStatus(a.Status) === 'Pending').length;

  const inboxAll = useMemo(
    () => inboxSources.flatMap((s) => s.rows.map((r) => ({ ...r, _type: s.key, _typeLabel: s.label }))),
    [inboxSources]
  );
  const inboxInRange = inboxAll.filter((r) => inRange(r.SubmittedAt, start));
  const newEnquiries = inboxInRange.filter((r) => normStatus(r.Status) === 'New').length;

  const publishedTeachers = (teachers.data ?? []).filter((t) => truthy(t.Published)).length;
  const classesInScope = (classes.data ?? []).filter((c) => filterClass === 'all' || c.ClassName === filterClass);
  const publishedTestimonials = (testimonials.data ?? []).filter((t) => truthy(t.Published));
  const avgRating = publishedTestimonials.length > 0
    ? Math.round((publishedTestimonials.reduce((sum, t) => sum + Number(t.Rating || 0), 0) / publishedTestimonials.length) * 10) / 10
    : 0;
  const publishedContentCount =
    (posts.data ?? []).filter((p) => truthy(p.Published)).length +
    (notices.data ?? []).filter((n) => truthy(n.Published)).length +
    (events.data ?? []).filter((e) => truthy(e.Published)).length +
    (toppers.data ?? []).filter((t) => truthy(t.Published)).length;

  // Trend: enquiries over the selected window (capped to a sensible charting range)
  const trendDays = dateRange === '7d' ? 7 : dateRange === 'today' ? 7 : 30;
  const trendDates = lastNDates(trendDays);
  const enquiryTrend = trendDates.map((date) => ({
    date,
    label: shortDayLabel(date),
    count: inboxAll.filter((r) => String(r.SubmittedAt ?? '').slice(0, 10) === date).length,
  }));

  // Attendance trend: fixed 14-day window (independent of the enquiries range — attendance is daily operational data)
  const attendanceDates = lastNDates(14);
  const attendanceTrend = attendanceDates.map((date) => ({
    date,
    label: shortDayLabel(date),
    present: attendanceInScope.filter((a) => a.Date === date && a.PunchIn).length,
  }));

  const studentsByClass = CLASSES.map((c) => ({
    className: c,
    count: allStudents.filter((s) => s.ClassName === c && s.Status === 'Active').length,
  }));

  type Activity = { id: string; icon: React.ComponentType<{ className?: string }>; typeLabel: string; title: string; status: string; submittedAt: string; href: string };
  const recentActivity: Activity[] = useMemo(() => {
    const fromInbox = inboxAll.map((r) => ({
      id: `${r._type}-${r.Id}`,
      icon: Inbox,
      typeLabel: r._typeLabel,
      title: inboxTitle(r._type, r),
      status: normStatus(r.Status),
      submittedAt: String(r.SubmittedAt ?? ''),
      href: '/admin/inbox',
    }));
    const fromApplications = (portalApplications.data ?? []).map((a) => ({
      id: `application-${a.Id}`,
      icon: UserCheck,
      typeLabel: 'Portal Application',
      title: `${a.StudentName} — Class ${a.ClassName}`,
      status: normStatus(a.Status),
      submittedAt: a.SubmittedAt,
      href: '/admin/applications',
    }));
    return [...fromInbox, ...fromApplications]
      .filter((item) => inRange(item.submittedAt, start))
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
      .slice(0, 10);
  }, [inboxAll, portalApplications.data, start]);

  const statusColor = (status: string) => {
    if (status === 'New' || status === 'Pending') return STATUS.warning;
    if (status === 'Contacted') return seriesColor;
    if (status === 'Resolved' || status === 'Approved') return STATUS.good;
    if (status === 'Rejected') return STATUS.critical;
    return STATUS.neutral;
  };

  const STATUS_OPTIONS = ['New', 'Contacted', 'Resolved', 'Closed'];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LayoutDashboard className="size-5 text-gold" />
          <div>
            <h2 className="font-display text-xl font-bold">Dashboard</h2>
            {me?.username && <p className="text-xs text-muted-foreground">Welcome back, {me.username}.</p>}
          </div>
        </div>
        <FilterBar dateRange={dateRange} onDateRange={setDateRange} filterClass={filterClass} onFilterClass={setFilterClass} />
      </div>

      {/* Primary KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard icon={Users} label="Enrolled Students" value={activeStudentsInScope.length} sublabel={filterClass === 'all' ? `${allStudents.length} total` : `Class ${filterClass}`} href="/admin/students" />
        <KpiCard icon={Bell} label={`New Enquiries · ${RANGE_OPTIONS.find((o) => o.value === dateRange)?.label}`} value={newEnquiries} sublabel={`${inboxAll.length} all time`} href="/admin/inbox" />
        <KpiCard icon={UserCheck} label="Pending Applications" value={pendingApplications} sublabel={`${(portalApplications.data ?? []).length} total`} href="/admin/applications" />
        <KpiCard icon={Clock} label="Attendance Today" value={attendanceRate} suffix="%" sublabel={`${presentToday} / ${activeStudentsInScope.length} present`} href="/admin/attendance" />
        <KpiCard icon={Users2} label="Faculty" value={publishedTeachers} sublabel={`${(teachers.data ?? []).length} total`} href="/admin/teachers" />
        <KpiCard icon={Video} label="Classes Posted" value={classesInScope.length} sublabel={filterClass === 'all' ? 'Live + recorded' : `Class ${filterClass}`} href="/admin/classes" />
        <KpiCard icon={Star} label="Avg. Rating" value={avgRating} sublabel={`${publishedTestimonials.length} published reviews`} href="/admin/content" />
        <KpiCard icon={Megaphone} label="Published Content" value={publishedContentCount} sublabel="Posts, notices, events, toppers" href="/admin/content" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="New Enquiries" description={`Daily submissions across all inbox types · last ${trendDays} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enquiryTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="enquiryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesColor} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={seriesColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  interval={Math.max(0, Math.ceil(enquiryTrend.length / 6) - 1)}
                />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <RechartsTooltip {...tooltipStyle()} />
                <Area type="monotone" dataKey="count" name="Enquiries" stroke={seriesColor} strokeWidth={2} fill="url(#enquiryFill)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Students by Class" description={filterClass === 'all' ? 'Active enrollment per class' : `Highlighting Class ${filterClass}`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByClass} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="className" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <RechartsTooltip {...tooltipStyle()} />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {studentsByClass.map((entry) => (
                    <Cell key={entry.className} fill={filterClass === 'all' || filterClass === entry.className ? seriesColor : 'var(--border)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Attendance trend + class breakdown */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Attendance — Last 14 Days" description={filterClass === 'all' ? 'Students present per day' : `Class ${filterClass} only`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <RechartsTooltip {...tooltipStyle()} />
                <Line type="monotone" dataKey="present" name="Present" stroke={seriesColor} strokeWidth={2} dot={{ r: 3, fill: seriesColor, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Inbox Backlog" description="All submissions by type and status (all time)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Type</th>
                  {STATUS_OPTIONS.map((s) => <th key={s} className="px-2 py-1.5 text-center font-medium">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {inboxSources.map((s) => (
                  <tr key={s.key} className="border-t border-border">
                    <td className="py-2 pr-2 font-medium">
                      <Link to="/admin/inbox" className="hover:text-gold">{s.label}</Link>
                    </td>
                    {STATUS_OPTIONS.map((status) => {
                      const count = s.rows.filter((r) => normStatus(r.Status) === status).length;
                      return (
                        <td key={status} className="px-2 py-2 text-center">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-full" style={{ backgroundColor: statusColor(status) }} />
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t border-border font-semibold">
                  <td className="py-2 pr-2">Total</td>
                  {STATUS_OPTIONS.map((status) => (
                    <td key={status} className="px-2 py-2 text-center">
                      {inboxAll.filter((r) => normStatus(r.Status) === status).length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Recent activity */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest enquiries and applications{dateRange !== 'all' ? ` · ${RANGE_OPTIONS.find((o) => o.value === dateRange)?.label.toLowerCase()}` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing in this period.</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item) => (
                <Link key={item.id} to={item.href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-secondary/60">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">{item.typeLabel}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: statusColor(item.status) }} />
                    <span className="text-muted-foreground">{item.status}</span>
                  </span>
                  <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">{timeAgo(item.submittedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content overview */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Content Overview</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile icon={Megaphone} label="Posts" value={(posts.data ?? []).filter((p) => truthy(p.Published)).length} total={(posts.data ?? []).length} href="/admin/posts" />
          <StatTile icon={FileText} label="Notices" value={(notices.data ?? []).filter((n) => truthy(n.Published)).length} total={(notices.data ?? []).length} href="/admin/content" />
          <StatTile icon={CalendarDays} label="Events" value={(events.data ?? []).filter((e) => truthy(e.Published)).length} total={(events.data ?? []).length} href="/admin/content" />
          <StatTile icon={Trophy} label="Toppers" value={(toppers.data ?? []).filter((t) => truthy(t.Published)).length} total={(toppers.data ?? []).length} href="/admin/content" />
          <StatTile icon={MessageSquareHeart} label="Testimonials" value={publishedTestimonials.length} total={(testimonials.data ?? []).length} href="/admin/content" />
          <StatTile icon={ImageIcon} label="Gallery Photos" value={(gallery.data ?? []).length} total={(gallery.data ?? []).length} href="/admin/gallery" />
          <StatTile icon={HelpCircle} label="Questions" value={(questions.data ?? []).filter((q) => truthy(q.Published)).length} total={(questions.data ?? []).length} href="/admin/questions" />
          <StatTile icon={NotebookText} label="Notes Shared" value={(notes.data ?? []).filter((n) => truthy(n.Published)).length} total={(notes.data ?? []).length} href="/admin/notes" />
          <StatTile icon={Award} label="Results" value={(results.data ?? []).filter((r) => truthy(r.Published)).length} total={(results.data ?? []).length} href="/admin/results" />
          <StatTile icon={Gauge} label="Classes" value={classesInScope.filter((c) => truthy(c.Published)).length} total={classesInScope.length} href="/admin/classes" />
        </div>
      </div>
    </div>
  );
}
