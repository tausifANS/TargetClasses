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

/**
 * Longer-lived session token for the Admin/Student portals, which don't (yet)
 * implement the access/refresh rotation the main auth system uses — a single
 * 12h token is a reasonable simplification for a single-admin, low-stakes
 * internal tool. Verified with verifyAccessToken() same as everything else,
 * since it's signed with the same secret.
 */
export const signAppToken = (payload) => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '12h' });
