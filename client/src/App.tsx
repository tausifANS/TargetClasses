import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { PlaceholderPage } from '@/components/placeholder-page';
import { HomePage } from '@/pages/home';
import { AboutPage } from '@/pages/about';
import { CoursesPage } from '@/pages/courses';
import { FacultyPage } from '@/pages/faculty';
import { GalleryPage } from '@/pages/gallery';
import { ToppersPage } from '@/pages/toppers';
import { AdmissionPage } from '@/pages/admission';
import { ContactPage } from '@/pages/contact';
import { FaqsPage } from '@/pages/faqs';
import { TestimonialsPage } from '@/pages/testimonials';
import { NoticesPage } from '@/pages/notices';
import { EventsPage } from '@/pages/events';
import { ResultsPage } from '@/pages/results';
import { StudentLifePage } from '@/pages/student-life';
import { BlogsPage } from '@/pages/blogs';
import { PrivacyPolicyPage } from '@/pages/privacy-policy';
import { TermsPage } from '@/pages/terms';
import { SupportPage } from '@/pages/support';
import { CareersPage } from '@/pages/careers';
import { ADMIN_SECTIONS, firstAllowedSection } from '@/components/admin/admin-shell';
import { useAdminMe, useIsAdminLoggedIn } from '@/hooks/use-admin';

const StudentPortalPage = lazy(() => import('@/pages/student-portal').then((m) => ({ default: m.StudentPortalPage })));
const AdminPortalPage = lazy(() => import('@/pages/admin-portal').then((m) => ({ default: m.AdminPortalPage })));
const DashboardPanel = lazy(() => import('@/pages/admin/dashboard-panel').then((m) => ({ default: m.DashboardPanel })));
const InboxPanel = lazy(() => import('@/pages/admin/inbox-panel').then((m) => ({ default: m.InboxPanel })));
const ApplicationsPanel = lazy(() => import('@/pages/admin/applications-panel').then((m) => ({ default: m.ApplicationsPanel })));
const StudentsPanel = lazy(() => import('@/pages/admin/students-attendance-panel').then((m) => ({ default: m.StudentsPanel })));
const AttendancePanel = lazy(() => import('@/pages/admin/students-attendance-panel').then((m) => ({ default: m.AttendancePanel })));
const ContentPanel = lazy(() => import('@/pages/admin/content-panel').then((m) => ({ default: m.ContentPanel })));
const ClassesPanel = lazy(() => import('@/pages/admin/classes-panel').then((m) => ({ default: m.ClassesPanel })));
const PostsPanel = lazy(() => import('@/pages/admin/posts-panel').then((m) => ({ default: m.PostsPanel })));
const GalleryPanel = lazy(() => import('@/pages/admin/gallery-panel').then((m) => ({ default: m.GalleryPanel })));
const TeachersPanel = lazy(() => import('@/pages/admin/teachers-panel').then((m) => ({ default: m.TeachersPanel })));
const QuestionsPanel = lazy(() => import('@/pages/admin/questions-panel').then((m) => ({ default: m.QuestionsPanel })));
const NotesPanel = lazy(() => import('@/pages/admin/notes-panel').then((m) => ({ default: m.NotesPanel })));
const ResultsPanel = lazy(() => import('@/pages/admin/results-panel').then((m) => ({ default: m.ResultsPanel })));
const SettingsPanel = lazy(() => import('@/pages/admin/settings-panel').then((m) => ({ default: m.SettingsPanel })));

const ADMIN_PANEL_ELEMENTS: Record<string, ReactNode> = {
  dashboard: <DashboardPanel />,
  inbox: <InboxPanel />,
  applications: <ApplicationsPanel />,
  students: <StudentsPanel />,
  attendance: <AttendancePanel />,
  classes: <ClassesPanel />,
  questions: <QuestionsPanel />,
  notes: <NotesPanel />,
  results: <ResultsPanel />,
  content: <ContentPanel />,
  posts: <PostsPanel />,
  gallery: <GalleryPanel />,
  teachers: <TeachersPanel />,
};

function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

/** Lands a fresh /admin visit on Inbox for full admins, or the teacher's first permitted section. */
function AdminIndexRedirect() {
  const loggedIn = useIsAdminLoggedIn();
  const { data: me, isLoading } = useAdminMe(loggedIn);

  if (loggedIn && isLoading) return <PageLoadingFallback />;
  const target = firstAllowedSection(me?.accountRole === 'teacher' ? me.permissions : null);
  return <Navigate to={target ?? 'settings'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/toppers" element={<ToppersPage />} />
          <Route path="/admission" element={<AdmissionPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/student-life" element={<StudentLifePage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found" description="The page you're looking for doesn't exist." />} />
        </Route>
        <Route path="/student-portal" element={<StudentPortalPage />} />
        <Route path="/admin" element={<AdminPortalPage />}>
          <Route index element={<AdminIndexRedirect />} />
          {ADMIN_SECTIONS.map((s) => (
            <Route key={s.value} path={s.value} element={ADMIN_PANEL_ELEMENTS[s.value]} />
          ))}
          <Route path="settings" element={<SettingsPanel />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
