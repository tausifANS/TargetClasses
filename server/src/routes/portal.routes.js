import { Router } from 'express';
import * as portalController from '../controllers/portal.controller.js';
import { validate } from '../middlewares/validate.js';
import { portalLoginLimiter } from '../middlewares/rateLimiter.js';
import { portalLoginSchema } from '../validators/portal.validators.js';

const router = Router();

router.post('/login', portalLoginLimiter, validate(portalLoginSchema), portalController.login);

export default router;
