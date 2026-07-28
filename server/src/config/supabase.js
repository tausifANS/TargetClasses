import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client — bypasses Row Level Security. Server-side only, never
 * expose this key or this client to the frontend. All privileged writes
 * (admission approval, ID generation, etc.) go through this.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Anon-key client — respects RLS. Used for anything we want scoped to the
 * requesting user's own policies rather than full admin access.
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
