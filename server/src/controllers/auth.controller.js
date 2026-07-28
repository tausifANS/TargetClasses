import { asyncHandler } from '../utils/asyncHandler.js';
import { isProd, env } from '../config/env.js';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import { sendEmail, passwordResetEmail } from '../services/email.service.js';
import { ApiError } from '../utils/ApiError.js';

const REFRESH_COOKIE = 'refresh_token';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days, matches JWT_REFRESH_EXPIRY default
};

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { tokens, user } = await authService.login(identifier, password);

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
  res.json({ success: true, data: { accessToken: tokens.accessToken, user } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No session found');

  const accessToken = await authService.refreshAccessToken(token);
  res.json({ success: true, data: { accessToken } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.sub);
  if (!user) throw ApiError.notFound('User not found');
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.roles?.name,
      mustChangePassword: user.must_change_password,
    },
  });
});

export const completeFirstLogin = asyncHandler(async (req, res) => {
  await authService.completeFirstLogin(req.user.sub, req.body.newPassword);
  res.json({ success: true, message: 'Password set successfully' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password updated' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.createPasswordResetToken(req.body.email);
  if (result) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${result.rawToken}`;
    await sendEmail({
      to: result.user.email,
      subject: 'Reset your Target Classes password',
      html: passwordResetEmail(resetUrl),
    });
  }
  // Always the same response — do not reveal whether the email exists.
  res.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordWithToken(req.body.token, req.body.newPassword);
  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});
