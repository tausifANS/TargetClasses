import { Router } from 'express';
import * as userAuthController from '../controllers/userAuth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/signup', userAuthController.signup);
router.post('/login', userAuthController.login);
router.get('/me', authenticate, userAuthController.me);

export default router;
