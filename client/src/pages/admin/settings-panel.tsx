import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSmtpSettings, useUpdateSmtpSettings } from '@/hooks/use-admin';
import { apiErrorMessage } from '@/lib/api';

export function SettingsPanel() {
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
      <div className="flex items-center gap-2.5">
        <Mail className="size-5 text-gold" />
        <h2 className="font-display text-xl font-bold">Email Settings</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
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
