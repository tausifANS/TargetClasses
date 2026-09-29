import { z } from 'zod';

export const portalLoginSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
  password: z.string().min(1, 'Please enter your password'),
});

export const portalForgotPasswordSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
});

export const portalResetPasswordSchema = z.object({
  token: z.string().min(1, 'Missing reset token'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
