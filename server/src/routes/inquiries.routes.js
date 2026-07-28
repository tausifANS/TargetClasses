import { Router } from 'express';
import * as inquiriesController from '../controllers/inquiries.controller.js';
import { validate } from '../middlewares/validate.js';
import { inquiryLimiter } from '../middlewares/rateLimiter.js';
import {
  admissionInquirySchema,
  contactInquirySchema,
  supportInquirySchema,
  careerInquirySchema,
  portalApplicationSchema,
  testimonialInquirySchema,
} from '../validators/inquiries.validators.js';

const router = Router();

router.use(inquiryLimiter);

router.post('/admissions', validate(admissionInquirySchema), inquiriesController.submitAdmission);
router.post('/contact', validate(contactInquirySchema), inquiriesController.submitContact);
router.post('/support', validate(supportInquirySchema), inquiriesController.submitSupport);
router.post('/careers', validate(careerInquirySchema), inquiriesController.submitCareer);
router.post('/portal-application', validate(portalApplicationSchema), inquiriesController.submitPortalApplication);
router.post('/testimonials', validate(testimonialInquirySchema), inquiriesController.submitTestimonial);

export default router;
