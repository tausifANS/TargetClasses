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
import { makeCrudController } from '../controllers/admin/crud.factory.js';
import {
  adminLoginSchema,
  inboxStatusSchema,
  noticeSchema,
  eventSchema,
  topperSchema,
  classContentSchema,
} from '../validators/admin.validators.js';

const router = Router();

router.post('/login', validate(adminLoginSchema), authController.login);
router.post('/login-account', adminAccountsController.loginWithAccount);

// Everything below requires a valid admin session.
router.use(authenticate, authorize('admin'));

router.get('/me', authController.me);

// Inbox — read-only submissions with a status field admins can update.
router.get('/inbox/:sheet', inboxController.list);
router.patch('/inbox/:sheet/:id', validate(inboxStatusSchema), inboxController.updateStatus);

// Student Portal signup approvals — with optional query filters.
router.get('/portal-applications', portalApplicationsController.list);
router.post('/portal-applications/:id/approve', portalApplicationsController.approve);
router.post('/portal-applications/:id/reject', portalApplicationsController.reject);

// Enrolled students + attendance.
router.get('/students', studentsController.list);
router.get('/attendance', attendanceController.list);

// Testimonials — moderation only (publish/unpublish), no create/delete (they're user-submitted).
const testimonials = makeCrudController('Testimonials');
router.get('/testimonials', testimonials.list);
router.patch('/testimonials/:id', testimonials.update);

// Notices / Events / Toppers — full CRUD.
const notices = makeCrudController('Notices');
router.get('/notices', notices.list);
router.post('/notices', validate(noticeSchema), notices.create);
router.patch('/notices/:id', notices.update);
router.delete('/notices/:id', notices.remove);

const events = makeCrudController('Events');
router.get('/events', events.list);
router.post('/events', validate(eventSchema), events.create);
router.patch('/events/:id', events.update);
router.delete('/events/:id', events.remove);

const toppers = makeCrudController('Toppers');
router.get('/toppers', toppers.list);
router.post('/toppers', validate(topperSchema), toppers.create);
router.patch('/toppers/:id', toppers.update);
router.delete('/toppers/:id', toppers.remove);

// Classes (live/recorded) posted for students.
const classes = makeCrudController('Classes');
router.get('/classes', classes.list);
router.post('/classes', validate(classContentSchema), classes.create);
router.patch('/classes/:id', classes.update);
router.delete('/classes/:id', classes.remove);

// Posts — highlighted announcements shown on the public site, with image upload.
router.get('/posts', postsController.list);
router.post('/posts', uploadImage, postsController.create);
router.patch('/posts/:id', uploadImage, postsController.update);
router.delete('/posts/:id', postsController.remove);

// Gallery — photo upload.
router.get('/gallery', galleryController.list);
router.post('/gallery', uploadImage, galleryController.upload);
router.patch('/gallery/:id', galleryController.update);
router.delete('/gallery/:id', galleryController.remove);

// Teachers — faculty team shown on the public site, with photo upload.
router.get('/teachers', teachersController.list);
router.post('/teachers', uploadImage, teachersController.create);
router.patch('/teachers/:id', uploadImage, teachersController.update);
router.delete('/teachers/:id', teachersController.remove);

// Questions (MCQ + Written)
router.get('/questions', questionsController.list);
router.post('/questions', questionsController.create);
router.patch('/questions/:id', questionsController.update);
router.delete('/questions/:id', questionsController.remove);

// Notes (PDF sharing)
router.get('/notes', notesController.list);
router.post('/notes', notesController.create);
router.patch('/notes/:id', notesController.update);
router.delete('/notes/:id', notesController.remove);

// Results
router.get('/results', resultsController.list);
router.post('/results', resultsController.create);
router.patch('/results/:id', resultsController.update);
router.delete('/results/:id', resultsController.remove);

// Admin Accounts management
router.get('/accounts', adminAccountsController.list);
router.post('/accounts', adminAccountsController.create);
router.delete('/accounts/:id', adminAccountsController.remove);
router.post('/change-password', adminAccountsController.changePassword);

export default router;
