import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Access tokens carry identity + role for authorization checks on every request.
 * Refresh tokens are opaque-ish (same signer, longer life) and are only ever
 * exchanged for a new access token — never accepted directly on protected routes.
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
