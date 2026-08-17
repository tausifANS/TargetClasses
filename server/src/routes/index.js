import { Router } from 'express';
import authRoutes from './auth.routes.js';
import inquiriesRoutes from './inquiries.routes.js';
import contentRoutes from './content.routes.js';
import portalRoutes from './portal.routes.js';
import adminRoutes from './admin.routes.js';
import questionsRoutes from './questions.routes.js';
import notesRoutes from './notes.routes.js';
import resultsRoutes from './results.routes.js';
import commentsRoutes from './comments.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'Target Classes API is running' }));
router.use('/auth', authRoutes);

// Google Sheets-backed modules (see database/google-apps-script/Code.gs) — inquiries
// (write) and content (read) while Supabase is unreachable.
router.use('/inquiries', inquiriesRoutes);
router.use('/content', contentRoutes);
router.use('/portal', portalRoutes);
router.use('/admin', adminRoutes);

// New student-facing modules
router.use('/questions', questionsRoutes);
router.use('/notes', notesRoutes);
router.use('/results', resultsRoutes);
router.use('/comments', commentsRoutes);

// Phase 2+ mount points (students, teachers, exams, fees, ...) will be added here
// as each module is built against Supabase once it's reachable again.

export default router;
