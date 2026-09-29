import { Router } from 'express';
import * as portalController from '../controllers/portal.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter, portalLoginLimiter } from '../middlewares/rateLimiter.js';
import { portalLoginSchema, portalForgotPasswordSchema, portalResetPasswordSchema } from '../validators/portal.validators.js';

const router = Router();

router.post('/login', portalLoginLimiter, validate(portalLoginSchema), portalController.login);
router.post('/forgot-password', authLimiter, validate(portalForgotPasswordSchema), portalController.forgotPassword);
router.post('/reset-password', authLimiter, validate(portalResetPasswordSchema), portalController.resetPassword);

router.use(authenticate, authorize('student'));

router.get('/me', portalController.me);
router.get('/classes', portalController.classes);
router.post('/attendance/punch-in', portalController.punchIn);
router.post('/attendance/punch-out', portalController.punchOut);
router.get('/attendance/history', portalController.attendanceHistory);

export default router;
