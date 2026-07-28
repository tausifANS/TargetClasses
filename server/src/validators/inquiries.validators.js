import { z } from 'zod';

const phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number');
const optionalEmail = z.union([z.string().email('Enter a valid email'), z.literal('')]).optional();

export const admissionInquirySchema = z.object({
  studentName: z.string().min(2, "Student's full name is required"),
  dob: z.string().min(1, 'Date of birth is required'),
  applyingFor: z.string().min(1, 'Please select a class'),
  parentName: z.string().min(2, 'Parent/guardian name is required'),
  phone,
  email: optionalEmail,
  address: z.string().min(5, 'Address is required'),
  message: z.string().optional().or(z.literal('')),
});

export const contactInquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone,
  email: optionalEmail,
  message: z.string().min(5, 'Message is required'),
});

export const supportInquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone,
  topic: z.string().min(1, 'Please select a topic'),
  message: z.string().min(5, 'Please describe your issue'),
});

export const careerInquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone,
  email: optionalEmail,
  message: z.string().min(5, 'Please tell us a bit about yourself'),
});

export const testimonialInquirySchema = z.object({
  parentName: z.string().min(2, 'Name is required'),
  studentName: z.string().optional().or(z.literal('')),
  message: z.string().min(5, "Please share your feedback"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});
