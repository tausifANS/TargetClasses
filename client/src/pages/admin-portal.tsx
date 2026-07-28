import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useIsAdminLoggedIn, useAdminLogout } from '@/hooks/use-admin';
import { AdminLoginPanel } from '@/pages/admin/login';
import { InboxPanel } from '@/pages/admin/inbox-panel';
import { ApplicationsPanel } from '@/pages/admin/applications-panel';
import { StudentsPanel, AttendancePanel } from '@/pages/admin/students-attendance-panel';
import { ContentPanel } from '@/pages/admin/content-panel';
import { ClassesPanel } from '@/pages/admin/classes-panel';
import { PostsPanel } from '@/pages/admin/posts-panel';
import { GalleryPanel } from '@/pages/admin/gallery-panel';

const SECTIONS = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'applications', label: 'Applications' },
  { value: 'students', label: 'Students' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'content', label: 'Content' },
  { value: 'classes', label: 'Classes' },
  { value: 'posts', label: 'Posts' },
  { value: 'gallery', label: 'Gallery' },
] as const;

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState<string>('inbox');

  return (
    <div className="min-h-screen bg-background">
      <title>Admin Dashboard | Target Classes</title>
      <header className="border-b border-border bg-card">
        <div className="section-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="font-display font-semibold">Target Classes Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="size-4" /> Website</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="size-4" /> Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="section-container py-10">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="flex h-auto w-fit flex-wrap gap-1 bg-secondary/60 p-1.5">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.value} value={s.value} className="rounded-full px-4 py-2 text-sm">
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-8">
            <TabsContent value="inbox"><InboxPanel /></TabsContent>
            <TabsContent value="applications"><ApplicationsPanel /></TabsContent>
            <TabsContent value="students"><StudentsPanel /></TabsContent>
            <TabsContent value="attendance"><AttendancePanel /></TabsContent>
            <TabsContent value="content"><ContentPanel /></TabsContent>
            <TabsContent value="classes"><ClassesPanel /></TabsContent>
            <TabsContent value="posts"><PostsPanel /></TabsContent>
            <TabsContent value="gallery"><GalleryPanel /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export function AdminPortalPage() {
  const [loggedIn, setLoggedIn] = useState(useIsAdminLoggedIn());
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return loggedIn ? <AdminDashboard onLogout={handleLogout} /> : <AdminLoginPanel onSuccess={() => setLoggedIn(true)} />;
}
