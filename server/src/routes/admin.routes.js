import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadImage } from '../middlewares/upload.js';
import * as authController from '../controllers/admin/auth.controller.js';
import * as inboxController from '../controllers/admin/inbox.controller.js';
import * as portalApplicationsController from '../controllers/admin/portalApplications.controller.js';
import * as galleryController from '../controllers/admin/gallery.controller.js';
import * as postsController from '../controllers/admin/posts.controller.js';
import * as teachersController from '../controllers/admin/teachers.controller.js';
import * as attendanceController from '../controllers/admin/attendance.controller.js';
import * as studentsController from '../controllers/admin/students.controller.js';
import * as questionsController from '../controllers/admin/questions.controller.js';
import * as notesController from '../controllers/admin/notes.controller.js';
import * as resultsController from '../controllers/admin/results.controller.js';
import * as adminAccountsController from '../controllers/admin/adminAccounts.controller.js';
import * as settingsController from '../controllers/admin/settings.controller.js';
import { makeCrudController } from '../controllers/admin/crud.factory.js';
import { requirePage, isTeacher } from '../utils/teacherScope.js';
import { ApiError } from '../utils/ApiError.js';
import {
  adminLoginSchema,
  inboxStatusSchema,
  noticeSchema,
  eventSchema,
  topperSchema,
  classContentSchema,
  smtpSettingsSchema,
} from '../validators/admin.validators.js';

const router = Router();

router.post('/login', validate(adminLoginSchema), authController.login);
router.post('/login-account', adminAccountsController.loginWithAccount);

// Everything below requires a valid admin session.
router.use(authenticate, authorize('admin'));

router.get('/me', authController.me);
router.post('/change-password', adminAccountsController.changePassword);

/** Blocks teacher accounts entirely from routes that are always full-admin-only. */
function adminOnly(req, _res, next) {
  if (isTeacher(req)) throw ApiError.forbidden("You don't have access to this section.");
  next();
}

// Inbox — read-only submissions with a status field admins can update. Admin-only.
router.get('/inbox/:sheet', adminOnly, inboxController.list);
router.patch('/inbox/:sheet/:id', adminOnly, validate(inboxStatusSchema), inboxController.updateStatus);

// Student Portal signup approvals — with optional query filters. Admin-only.
router.get('/portal-applications', adminOnly, portalApplicationsController.list);
router.post('/portal-applications/:id/approve', adminOnly, portalApplicationsController.approve);
router.post('/portal-applications/:id/reject', adminOnly, portalApplicationsController.reject);

// Enrolled students + attendance — teacher accounts see only their own batch.
router.get('/students', requirePage('students'), studentsController.list);
router.post('/students/:studentId/reset-password', requirePage('students'), studentsController.resetPassword);
router.get('/attendance', requirePage('attendance'), attendanceController.list);

// Testimonials — moderation only (publish/unpublish), no create/delete (they're user-submitted). Admin-only.
const testimonials = makeCrudController('Testimonials');
router.get('/testimonials', adminOnly, testimonials.list);
router.patch('/testimonials/:id', adminOnly, testimonials.update);

// Notices / Events / Toppers — full CRUD. Admin-only (site-wide content, not batch-specific).
const notices = makeCrudController('Notices');
router.get('/notices', adminOnly, notices.list);
router.post('/notices', adminOnly, validate(noticeSchema), notices.create);
router.patch('/notices/:id', adminOnly, notices.update);
router.delete('/notices/:id', adminOnly, notices.remove);

const events = makeCrudController('Events');
router.get('/events', adminOnly, events.list);
router.post('/events', adminOnly, validate(eventSchema), events.create);
router.patch('/events/:id', adminOnly, events.update);
router.delete('/events/:id', adminOnly, events.remove);

const toppers = makeCrudController('Toppers');
router.get('/toppers', adminOnly, toppers.list);
router.post('/toppers', adminOnly, validate(topperSchema), toppers.create);
router.patch('/toppers/:id', adminOnly, toppers.update);
router.delete('/toppers/:id', adminOnly, toppers.remove);

// Classes (live/recorded) posted for students — teacher accounts are scoped to their own batch.
const classes = makeCrudController('Classes', { classScoped: true });
router.get('/classes', requirePage('classes'), classes.list);
router.post('/classes', requirePage('classes'), validate(classContentSchema), classes.create);
router.patch('/classes/:id', requirePage('classes'), classes.update);
router.delete('/classes/:id', requirePage('classes'), classes.remove);

// Posts — highlighted announcements shown on the public site, with image upload. Admin-only.
router.get('/posts', adminOnly, postsController.list);
router.post('/posts', adminOnly, uploadImage, postsController.create);
router.patch('/posts/:id', adminOnly, uploadImage, postsController.update);
router.delete('/posts/:id', adminOnly, postsController.remove);

// Gallery — photo upload. Teachers can be granted access, but it isn't batch-scoped (photos aren't tied to a class).
router.get('/gallery', requirePage('gallery'), galleryController.list);
router.post('/gallery', requirePage('gallery'), uploadImage, galleryController.upload);
router.patch('/gallery/:id', requirePage('gallery'), galleryController.update);
router.delete('/gallery/:id', requirePage('gallery'), galleryController.remove);

// Teachers — faculty team shown on the public site, with photo upload. Admin-only (this is the public
// faculty directory, unrelated to teacher login accounts managed under /accounts).
router.get('/teachers', adminOnly, teachersController.list);
router.post('/teachers', adminOnly, uploadImage, teachersController.create);
router.patch('/teachers/:id', adminOnly, uploadImage, teachersController.update);
router.delete('/teachers/:id', adminOnly, teachersController.remove);

// Questions (MCQ + Written) — teacher accounts are scoped to their own batch.
router.get('/questions', requirePage('questions'), questionsController.list);
router.post('/questions', requirePage('questions'), questionsController.create);
router.patch('/questions/:id', requirePage('questions'), questionsController.update);
router.delete('/questions/:id', requirePage('questions'), questionsController.remove);

// Notes (PDF sharing) — teacher accounts are scoped to their own batch.
router.get('/notes', requirePage('notes'), notesController.list);
router.post('/notes', requirePage('notes'), notesController.create);
router.patch('/notes/:id', requirePage('notes'), notesController.update);
router.delete('/notes/:id', requirePage('notes'), notesController.remove);

// Results — teacher accounts are scoped to their own batch.
router.get('/results', requirePage('results'), resultsController.list);
router.post('/results', requirePage('results'), resultsController.create);
router.patch('/results/:id', requirePage('results'), resultsController.update);
router.delete('/results/:id', requirePage('results'), resultsController.remove);

// Admin Accounts management. Admin-only — a teacher account cannot create or remove other accounts.
router.get('/accounts', adminOnly, adminAccountsController.list);
router.post('/accounts', adminOnly, adminAccountsController.create);
router.delete('/accounts/:id', adminOnly, adminAccountsController.remove);

// Email (SMTP) settings — editable at runtime since env vars can't change
// after deploy. Password value is never sent back to the client. Admin-only.
router.get('/settings/smtp', adminOnly, settingsController.getSmtpSettings);
router.patch('/settings/smtp', adminOnly, validate(smtpSettingsSchema), settingsController.updateSmtpSettings);

export default router;
