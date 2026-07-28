import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Reads the access token from the Authorization header or the httpOnly cookie set at login. */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.access_token) return req.cookies.access_token;
  return null;
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { sub, role, email, studentId? }
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }
});

/** Usage: authorize('admin', 'super_admin') — must run after authenticate(). */
export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) throw ApiError.unauthorized('Authentication required');
  if (!allowedRoles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  next();
};

/** Attaches req.user if a valid token is present, but never blocks the request. */
export const optionalAuth = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Silently ignore — the route is public either way.
  }
  next();
};
