import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import * as userService from './user.service.js';

const BCRYPT_ROUNDS = 12;
const isEmailLike = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

function buildTokenPayload(user) {
  return { sub: user.id, role: user.roles?.name ?? user.role, email: user.email ?? null };
}

export async function issueSession(user) {
  const payload = buildTokenPayload(user);
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: payload.sub }),
  };
}

/** identifier = email (admin/teacher) or student_code (student) */
export async function login(identifier, password) {
  const user = isEmailLike(identifier)
    ? await userService.getUserByEmail(identifier)
    : await userService.getUserByStudentCode(identifier);

  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated. Contact the institute office.');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  await userService.touchLastLogin(user.id);
  const tokens = await issueSession(user);

  return {
    tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.roles?.name,
      mustChangePassword: user.must_change_password,
    },
  };
}

export async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Session expired, please log in again');
  }
  const user = await userService.getUserById(payload.sub);
  if (!user || !user.is_active) throw ApiError.unauthorized('Session expired, please log in again');
  return signAccessToken(buildTokenPayload(user));
}

/** First login after admission approval: student must replace the temp password. */
export async function completeFirstLogin(userId, newPassword) {
  const hash = await hashPassword(newPassword);
  await userService.updatePassword(userId, hash, { mustChangePassword: false });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userService.getUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const { data } = await supabaseAdmin.from('users').select('password_hash').eq('id', userId).single();
  const valid = await comparePassword(currentPassword, data.password_hash);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  const hash = await hashPassword(newPassword);
  await userService.updatePassword(userId, hash, { mustChangePassword: false });
}

// ---- Password reset (forgot password) ----

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

export async function createPasswordResetToken(email) {
  const user = await userService.getUserByEmail(email);
  if (!user) return null; // caller always responds generically — don't leak account existence

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  const { error } = await supabaseAdmin.from('auth_tokens').insert({
    user_id: user.id,
    token_hash: sha256(rawToken),
    type: 'password_reset',
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw ApiError.internal(error.message);

  return { rawToken, user };
}

export async function resetPasswordWithToken(rawToken, newPassword) {
  const tokenHash = sha256(rawToken);
  const { data: tokenRow, error } = await supabaseAdmin
    .from('auth_tokens')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .eq('type', 'password_reset')
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!tokenRow || tokenRow.used_at || new Date(tokenRow.expires_at) < new Date()) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  const hash = await hashPassword(newPassword);
  await userService.updatePassword(tokenRow.user_id, hash, { mustChangePassword: false });
  await supabaseAdmin.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenRow.id);
}
