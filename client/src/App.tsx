import { Routes, Route } from 'react-router-dom';
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
import { StudentPortalPage } from '@/pages/student-portal';

export default function App() {
  return (
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
      <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" description="Coming in Phase 4." />} />
    </Routes>
  );
}
