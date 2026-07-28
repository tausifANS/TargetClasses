import { Router } from 'express';
import * as contentController from '../controllers/content.controller.js';

const router = Router();

router.get('/testimonials', contentController.getTestimonials);
router.get('/notices', contentController.getNotices);
router.get('/events', contentController.getEvents);
router.get('/toppers', contentController.getToppers);

export default router;
