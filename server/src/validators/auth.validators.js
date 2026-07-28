import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or Student ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const firstLoginSchema = z.object({
  newPassword: strongPassword,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: strongPassword,
});
