import 'dotenv/config';
import { z } from 'zod';

// Fail fast on boot rather than crashing later mid-request with a cryptic error.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Google Sheets — used as the backend for inquiries (admissions/contact/support/
  // careers/testimonials) and simple published content (notices/events/toppers)
  // while Supabase is unreachable. See database/google-apps-script/Code.gs.
  GOOGLE_SHEETS_WEBAPP_URL: z.union([z.string().url(), z.literal('')]).optional(),
  GOOGLE_SHEETS_API_SECRET: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  INSTITUTE_NAME: z.string().default('Target Classes'),
  INSTITUTE_PHONE: z.string().optional(),
  INSTITUTE_WHATSAPP: z.string().optional(),
  INSTITUTE_EMAIL: z.string().optional(),
  INSTITUTE_ADDRESS: z.string().optional(),
  INSTITUTE_YOUTUBE: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
