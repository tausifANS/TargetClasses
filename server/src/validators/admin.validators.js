import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const inboxStatusSchema = z.object({
  status: z.string().min(1),
});

export const noticeSchema = z.object({
  Title: z.string().min(2),
  Body: z.string().min(2),
  Published: z.boolean().optional(),
});

export const eventSchema = z.object({
  Title: z.string().min(2),
  Description: z.string().min(2),
  EventDate: z.string().optional().or(z.literal('')),
  Published: z.boolean().optional(),
});

export const topperSchema = z.object({
  StudentName: z.string().min(2),
  ClassName: z.string().min(1),
  Achievement: z.string().min(2),
  Year: z.union([z.string(), z.number()]).optional(),
  Published: z.boolean().optional(),
});

export const classContentSchema = z.object({
  Title: z.string().min(2),
  Subject: z.string().min(1),
  ClassName: z.string().min(1),
  Type: z.enum(['Live', 'Recorded']),
  Url: z.string().url('Enter a valid link'),
  ScheduledAt: z.string().optional().or(z.literal('')),
  Published: z.boolean().optional(),
});

export const galleryUploadSchema = z.object({
  category: z.string().min(1),
  caption: z.string().optional().or(z.literal('')),
});
