import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, ShieldCheck, ShieldAlert, ExternalLink, KeyRound, Users, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useSmtpSettings,
  useUpdateSmtpSettings,
  useChangeAdminPassword,
  useAdminAccountsList,
  useCreateAdminAccount,
  useDeleteAdminAccount,
  useAdminMe,
  type TeacherPage,
} from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { formatDateDMY } from '@/lib/utils';
import { COACHING_CLASSES } from '@/constants/site';

const TEACHER_PAGE_OPTIONS: { value: TeacherPage; label: string }[] = [
  { value: 'students', label: 'Students' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'classes', label: 'Classes' },
  { value: 'questions', label: 'Questions' },
  { value: 'notes', label: 'Notes' },
  { value: 'results', label: 'Results' },
  { value: 'gallery', label: 'Gallery (photos)' },
];

function EmailSettingsSection() {
  const { data, isLoading } = useSmtpSettings(true);
  const update = useUpdateSmtpSettings();

  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [user, setUser] = useState('');
  const [from, setFrom] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!data) return;
    setHost(data.host);
    setPort(data.port);
    setUser(data.user);
    setFrom(data.from);
  }, [data]);

  const handleSave = async () => {
    if (!user || !host || !port) {
      toast.error('Host, port, and email address are required');
      return;
    }
    try {
      await update.mutateAsync({ host, port, user, from, password: password || undefined });
      setPassword('');
      toast.success('Email settings saved', { description: 'Takes effect on the very next email — no restart needed.' });
    } catch (err) {
      toast.error('Could not save settings', { description: apiErrorMessage(err) });
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Used to send Student Portal login credentials when you approve an application. If a Gmail App Password
        expires or gets revoked, update it here — no code changes or redeploy needed.
      </p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

      {data && (
        <>
          <div className="mt-5 flex items-center gap-2">
            {data.passwordSet ? (
              <Badge variant="default"><ShieldCheck className="size-3.5" /> Password configured</Badge>
            ) : (
              <Badge variant="muted"><ShieldAlert className="size-3.5" /> No password set — emails won't send</Badge>
            )}
            {data.overridden && <Badge variant="outline">Overriding deployment defaults</Badge>}
          </div>

          <div className="mt-5 grid gap-4 rounded-xl border border-border bg-secondary/30 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" value={host} onChange={(e) => setHost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtp-port">Port</Label>
              <Input id="smtp-port" placeholder="587" value={port} onChange={(e) => setPort(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="smtp-user">Email Address</Label>
              <Input id="smtp-user" type="email" placeholder="you@gmail.com" value={user} onChange={(e) => setUser(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="smtp-from">"From" Name (optional)</Label>
              <Input id="smtp-from" placeholder='"Target Classes" <you@gmail.com>' value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="smtp-pass">Gmail App Password</Label>
              <Input
                id="smtp-pass"
                type="password"
                placeholder={data.passwordSet ? 'Leave blank to keep the current password' : '16-character app password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                Generate a new Gmail App Password <ExternalLink className="size-3" />
              </a>
            </div>
            <Button variant="gold" size="sm" className="w-fit sm:col-span-2" onClick={handleSave} disabled={update.isPending}>
              Save Email Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ChangePasswordSection() {
  const { data: me } = useAdminMe(true);
  const changePassword = useChangeAdminPassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (me?.isOwner) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Change the password for your own admin login. This only applies to accounts created under "Admin Accounts".
        </p>
        <div className="mt-5 flex max-w-md items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold" />
          <div className="text-sm">
            <p className="font-medium text-foreground">You're signed in as the owner account</p>
            <p className="mt-1 text-muted-foreground">
              The original account configured at deployment isn't stored in Admin Accounts, so its password can't
              be changed from this page. Update <code className="rounded bg-secondary px-1 py-0.5 text-xs">ADMIN_PASSWORD_HASH</code> in
              the server's <code className="rounded bg-secondary px-1 py-0.5 text-xs">.env</code> file instead. If
              you need day-to-day logins that can change their own password, create one under "Admin Accounts".
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Current and new password are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Could not update password', { description: apiErrorMessage(err, 'Current password is incorrect.') });
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Change the password for your own admin login. This only applies to accounts created under "Admin Accounts" —
        the original owner account configured at deployment cannot be changed here.
      </p>

      <div className="mt-5 grid max-w-md gap-4 rounded-xl border border-border bg-secondary/30 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button variant="gold" size="sm" className="w-fit" onClick={handleSubmit} disabled={changePassword.isPending}>
          Update Password
        </Button>
      </div>
    </div>
  );
}

function AdminAccountsSection() {
  const { data, isLoading } = useAdminAccountsList(true);
  const create = useCreateAdminAccount();
  const remove = useDeleteAdminAccount();
  const rows = data ?? [];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [batch, setBatch] = useState('');
  const [permissions, setPermissions] = useState<TeacherPage[]>([]);

  const togglePermission = (page: TeacherPage) => {
    setPermissions((prev) => (prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]));
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('admin');
    setBatch('');
    setPermissions([]);
  };

  const handleCreate = async () => {
    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (role === 'teacher' && !batch) {
      toast.error('Please assign a batch/class for this teacher');
      return;
    }
    if (role === 'teacher' && permissions.length === 0) {
      toast.error('Give this teacher access to at least one section');
      return;
    }
    try {
      await create.mutateAsync({
        username,
        password,
        role,
        className: role === 'teacher' ? batch : undefined,
        permissions: role === 'teacher' ? permissions : undefined,
      });
      toast.success(role === 'teacher' ? 'Teacher account created' : 'Admin account created');
      resetForm();
    } catch (err) {
      toast.error('Could not create account', { description: apiErrorMessage(err) });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove account "${name}"? They will no longer be able to log in.`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Account removed');
    } catch (err) {
      toast.error('Could not remove account', { description: apiErrorMessage(err) });
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Create additional logins for staff. A "Teacher" account only sees the sections you grant below, scoped to
        their assigned batch — an "Admin" account has full access, same as you.
      </p>

      <div className="mt-5 space-y-4 rounded-xl border border-border bg-secondary/30 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'teacher')}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin (full access)</SelectItem>
              <SelectItem value="teacher">Teacher (scoped access)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {role === 'teacher' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1.5">
              <Label>Assigned Batch / Class</Label>
              <Select value={batch} onValueChange={setBatch}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select a class" /></SelectTrigger>
                <SelectContent>
                  {COACHING_CLASSES.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Everything this teacher can see or create is limited to this batch.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Section Access</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TEACHER_PAGE_OPTIONS.map((p) => (
                  <Label key={p.value} className="flex items-center gap-2 text-sm font-normal">
                    <Checkbox checked={permissions.includes(p.value)} onCheckedChange={() => togglePermission(p.value)} />
                    {p.label}
                  </Label>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button variant="gold" size="sm" className="w-fit" onClick={handleCreate} disabled={create.isPending}>
          <UserPlus className="size-4" /> Create Account
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">No additional accounts yet.</p>}
        {rows.map((a) => (
          <div key={a.Id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="min-w-0">
              <p className="truncate font-display font-semibold">{a.Username}</p>
              <p className="text-xs text-muted-foreground">
                {a.Role === 'teacher' ? `Teacher · Class ${a.ClassName}` : 'Admin · Full access'} &middot; Added {formatDateDMY(a.SubmittedAt)}
              </p>
              {a.Role === 'teacher' && a.Permissions && a.Permissions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {a.Permissions.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">
                      {TEACHER_PAGE_OPTIONS.find((o) => o.value === p)?.label ?? p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={a.Status === 'Active' ? 'default' : 'muted'}>{a.Status === 'Active' ? 'Active' : a.Status}</Badge>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(a.Id, a.Username)} aria-label="Remove account">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const [active, setActive] = useState('email');

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Mail className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Settings</h2>
      </div>

      <Tabs value={active} onValueChange={setActive} className="mt-5">
        <TabsList className="flex h-auto w-fit flex-wrap gap-1 bg-secondary/60 p-1.5">
          <TabsTrigger value="email" className="rounded-full px-3.5 py-1.5 text-sm"><Mail className="mr-1 size-3.5" />Email</TabsTrigger>
          <TabsTrigger value="password" className="rounded-full px-3.5 py-1.5 text-sm"><KeyRound className="mr-1 size-3.5" />My Password</TabsTrigger>
          <TabsTrigger value="accounts" className="rounded-full px-3.5 py-1.5 text-sm"><Users className="mr-1 size-3.5" />Admin Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-5">
          <EmailSettingsSection />
        </TabsContent>
        <TabsContent value="password" className="mt-5">
          <ChangePasswordSection />
        </TabsContent>
        <TabsContent value="accounts" className="mt-5">
          <AdminAccountsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
