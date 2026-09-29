import { ApiError } from './ApiError.js';

/**
 * Page keys a teacher account can be granted, independently of their batch.
 * Kept in sync with the checklist in Settings → Admin Accounts on the client.
 * Full admins (accountRole !== 'teacher') always have every page.
 */
export const TEACHER_PAGES = ['students', 'attendance', 'classes', 'questions', 'notes', 'results', 'gallery'];

/** True for a teacher-scoped account; false for the env owner or a full "admin"-role AdminAccounts row. */
export function isTeacher(req) {
  return req.user?.accountRole === 'teacher';
}

/** Throws 403 if a teacher account wasn't granted this page. No-op for full admins. */
export function requirePage(pageKey) {
  return (req, _res, next) => {
    if (isTeacher(req) && !req.user.permissions?.includes(pageKey)) {
      throw ApiError.forbidden("You don't have access to this section.");
    }
    next();
  };
}

// Google Sheets silently stores a numeric-looking class name (e.g. "10") as an actual number,
// while the JWT's className claim and every request body are always strings — compare both
// sides as strings everywhere, or a batch like "10" would never match its own rows.
const sameClass = (a, b) => String(a) === String(b);

/** Filters a list of class-scoped rows down to the teacher's own batch. No-op for full admins. */
export function scopeRowsToTeacher(req, rows) {
  if (!isTeacher(req)) return rows;
  return rows.filter((row) => sameClass(row.ClassName, req.user.className));
}

/** Forces a create payload's ClassName to the teacher's own batch, ignoring whatever the client sent. No-op for full admins. */
export function forceTeacherClassName(req, body) {
  if (!isTeacher(req)) return body;
  return { ...body, className: req.user.className };
}

/** Throws 403 if a teacher tries to update/delete a row outside their own batch. No-op for full admins. */
export function assertRowInTeacherScope(req, row) {
  if (!isTeacher(req)) return;
  if (!row || !sameClass(row.ClassName, req.user.className)) {
    throw ApiError.forbidden("You don't have access to this record.");
  }
}
