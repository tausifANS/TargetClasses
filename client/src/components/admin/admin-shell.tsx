import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Inbox,
  UserCheck,
  Users,
  Clock,
  Video,
  HelpCircle,
  NotebookText,
  Award,
  FileText,
  Megaphone,
  Image as ImageIcon,
  Users2,
  Settings as SettingsIcon,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Menu,
  Lock,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SidebarProvider,
  Sidebar,
  SidebarMobile,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarNavItem,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAdminMe, type TeacherPage } from '@/hooks/use-admin';

export const ADMIN_SECTIONS = [
  { value: 'inbox', label: 'Inbox', icon: Inbox },
  { value: 'applications', label: 'Applications', icon: UserCheck },
  { value: 'students', label: 'Students', icon: Users },
  { value: 'attendance', label: 'Attendance', icon: Clock },
  { value: 'classes', label: 'Classes', icon: Video },
  { value: 'questions', label: 'Questions', icon: HelpCircle },
  { value: 'notes', label: 'Notes', icon: NotebookText },
  { value: 'results', label: 'Results', icon: Award },
  { value: 'content', label: 'Content', icon: FileText },
  { value: 'posts', label: 'Posts', icon: Megaphone },
  { value: 'gallery', label: 'Gallery', icon: ImageIcon },
  { value: 'teachers', label: 'Teachers', icon: Users2 },
] as const;

/** The default page to land on after login — first item a teacher is actually allowed to see, else Inbox. */
export function firstAllowedSection(permissions: TeacherPage[] | null | undefined) {
  if (!permissions) return 'inbox';
  return ADMIN_SECTIONS.find((s) => permissions.includes(s.value as TeacherPage))?.value ?? null;
}

function SidebarNav({ sections, showSettings, onNavigate }: { sections: readonly (typeof ADMIN_SECTIONS)[number][]; showSettings: boolean; onNavigate?: () => void }) {
  return (
    <>
      <SidebarSection>
        {sections.map((s) => (
          <SidebarNavItem key={s.value} to={s.value} icon={s.icon} onNavigate={onNavigate}>
            {s.label}
          </SidebarNavItem>
        ))}
      </SidebarSection>
      {showSettings && (
        <>
          <Separator className="my-1" />
          <SidebarSection>
            <SidebarNavItem to="settings" icon={SettingsIcon} onNavigate={onNavigate}>
              Settings
            </SidebarNavItem>
          </SidebarSection>
        </>
      )}
    </>
  );
}

function BrandHeader() {
  return (
    <SidebarHeader>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <LayoutDashboard className="size-5" />
      </div>
      <span className="truncate font-display font-semibold">Target Classes</span>
    </SidebarHeader>
  );
}

function RestrictedNotice() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Lock className="size-5" />
      </div>
      <p className="font-display font-semibold">You don't have access to this section</p>
      <p className="max-w-sm text-sm text-muted-foreground">Ask an admin to grant you access from Settings → Admin Accounts if you need it.</p>
    </div>
  );
}

export function AdminShell({ onLogout, children }: { onLogout: () => void; children: ReactNode }) {
  const { data: me } = useAdminMe(true);
  const location = useLocation();

  const isTeacherAccount = me?.accountRole === 'teacher';
  const permissions = isTeacherAccount ? me?.permissions ?? [] : null;
  const sections = permissions ? ADMIN_SECTIONS.filter((s) => permissions.includes(s.value as TeacherPage)) : ADMIN_SECTIONS;

  const currentKey = location.pathname.split('/')[2];
  const restricted = !!permissions && !!currentKey && !permissions.includes(currentKey as TeacherPage);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <title>Admin Dashboard | Target Classes</title>

        <Sidebar>
          <BrandHeader />
          <SidebarContent>
            <SidebarNav sections={sections} showSettings={!isTeacherAccount} />
          </SidebarContent>
        </Sidebar>

        <SidebarMobile>
          <BrandHeader />
          <SidebarContent className="p-3">
            <SidebarNav sections={sections} showSettings={!isTeacherAccount} />
          </SidebarContent>
        </SidebarMobile>

        <div className="lg:pl-64">
          <header className="border-b border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-2.5">
                <SidebarTrigger>
                  {(open) => (
                    <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={open}>
                      <Menu className="size-5" />
                    </Button>
                  )}
                </SidebarTrigger>
                <span className="truncate font-display font-semibold lg:hidden">Admin</span>
                {isTeacherAccount && me?.className && (
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    <GraduationCap className="size-3.5" /> Class {me.className} Teacher
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">
                    <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Website</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="size-4" /> <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="section-container py-8">{restricted ? <RestrictedNotice /> : children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
