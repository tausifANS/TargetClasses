import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import * as sheetsService from './sheets.service.js';
import { compressToDataUrl, dataUrlToBuffer } from '../utils/imageStorage.js';
import { signResetToken, verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

const BCRYPT_ROUNDS = 10;
const sha256 = (value) => crypto.createHash('sha256').update(value || '').digest('hex');

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash || '');

export async function getAllStudentAccounts() {
  return sheetsService.listRows('StudentAccounts');
}

export async function findStudentAccountByStudentId(studentId) {
  const rows = await getAllStudentAccounts();
  return (
    rows.find((row) => String(row.StudentId ?? '').trim().toLowerCase() === studentId.trim().toLowerCase()) || null
  );
}

/** Verifies Student ID + password. Never reveals which field was wrong. */
export async function authenticateStudent(studentId, password) {
  const account = await findStudentAccountByStudentId(studentId);
  if (!account) return null;
  if (String(account.Status ?? '').toLowerCase() === 'inactive') return null;

  const valid = await comparePassword(password, account.PasswordHash);
  if (!valid) return null;

  return sanitizeAccount(account);
}

export function sanitizeAccount(account) {
  return {
    studentId: account.StudentId,
    studentName: account.StudentName,
    className: account.ClassName,
    email: account.Email,
    parentPhone: account.ParentPhone,
    status: account.Status,
  };
}

// ---- Password reset (forgot password) ----

/**
 * Stateless reset token — no separate storage in the Sheet (updating the
 * Apps Script's column config would require redeploying it). The token
 * embeds a hash of the account's *current* PasswordHash, so it stops
 * verifying the moment the password actually changes — an approximation of
 * single-use without needing server-side token storage.
 */
export async function createPasswordResetToken(studentId) {
  const account = await findStudentAccountByStudentId(studentId);
  if (!account) return null; // caller always responds generically — don't leak account existence
  if (String(account.Status ?? '').toLowerCase() === 'inactive') return null;

  const rawToken = signResetToken({
    sub: account.StudentId,
    purpose: 'student-password-reset',
    pwv: sha256(account.PasswordHash),
  });
  return { rawToken, account };
}

export async function resetPasswordWithToken(rawToken, newPassword) {
  let payload;
  try {
    payload = verifyAccessToken(rawToken);
  } catch {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }
  if (payload.purpose !== 'student-password-reset') {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  const account = await findStudentAccountByStudentId(payload.sub);
  if (!account || sha256(account.PasswordHash) !== payload.pwv) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(newPassword);
  await sheetsService.updateRow('StudentAccounts', account.Id, { PasswordHash: passwordHash });
}

/** Generates the next sequential Student ID, e.g. TC-2026-004. */
export async function generateNextStudentId() {
  const rows = await getAllStudentAccounts();
  const year = new Date().getFullYear();
  const seq = rows.length + 1;
  return `TC-${year}-${String(seq).padStart(3, '0')}`;
}

function randomPassword() {
  // 8 random alphanumeric chars, easy enough to read out/type on a first login.
  return Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6);
}

/**
 * Admin-triggered credential reset — e.g. the approval email never arrived, or
 * got lost. Unlike the self-serve forgot-password flow this sets the password
 * immediately (admin can also hand it to the student directly instead of
 * relying on email) rather than emailing a reset link. Returns the plaintext
 * password so the admin UI can display/copy it.
 */
export async function adminResetStudentPassword(studentId, newPlainPassword) {
  const account = await findStudentAccountByStudentId(studentId);
  if (!account) throw ApiError.notFound('Student account not found');

  const plainPassword = newPlainPassword || randomPassword();
  const passwordHash = await hashPassword(plainPassword);
  await sheetsService.updateRow('StudentAccounts', account.Id, { PasswordHash: passwordHash });

  return { plainPassword, account };
}

/** Creates a StudentAccounts row from an approved PortalApplication. Returns the plaintext password (only ever returned here, for the approval email). */
export async function createStudentAccount({ applicationId, studentName, className, email, parentPhone }) {
  const studentId = await generateNextStudentId();
  const plainPassword = randomPassword();
  const passwordHash = await hashPassword(plainPassword);

  await sheetsService.appendRow('StudentAccounts', {
    StudentId: studentId,
    StudentName: studentName,
    ClassName: className,
    Email: email || '',
    ParentPhone: parentPhone || '',
    PasswordHash: passwordHash,
    Status: 'Active',
    ApplicationId: applicationId || '',
  });

  return { studentId, plainPassword };
}

// ---- Attendance ----

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

// Older rows (written before Code.gs started forcing the Date column to
// plain text) may still have round-tripped through Sheets' auto date
// conversion — e.g. an intended "2026-08-17" comes back as
// "2026-08-16T18:30:00.000Z" (midnight IST, shifted to UTC). Recover the
// calendar date that was actually meant so lookups/display stay correct for
// that historical data too, not just rows written after the Apps Script fix.
export function normalizeDateOnly(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export async function getTodayAttendance(studentId) {
  const rows = await sheetsService.listRows('Attendance');
  const today = todayDateOnly();
  return rows.find((r) => r.StudentId === studentId && normalizeDateOnly(r.Date) === today) || null;
}

export async function punchIn(studentId, photo) {
  const existing = await getTodayAttendance(studentId);
  if (existing) return { alreadyPunched: true, record: existing };

  // The client sends a raw <canvas> capture — re-compress it through the same
  // size-guaranteed path as every other Sheets-stored photo so it can never
  // exceed the 50,000-character Google Sheets cell limit (a canvas JPEG at
  // 0.7 quality routinely lands well above that as base64).
  const photoUrl = photo ? await compressToDataUrl(dataUrlToBuffer(photo)) : '';

  const record = await sheetsService.appendRow('Attendance', {
    StudentId: studentId,
    Date: todayDateOnly(),
    PunchIn: new Date().toISOString(),
    PunchOut: '',
    PhotoUrl: photoUrl,
  });
  return { alreadyPunched: false, record };
}

export async function punchOut(studentId) {
  const existing = await getTodayAttendance(studentId);
  if (!existing) return { noPunchIn: true };
  if (existing.PunchOut) return { alreadyPunchedOut: true, record: existing };

  const updated = await sheetsService.updateRow('Attendance', existing.Id, {
    PunchOut: new Date().toISOString(),
  });
  return { record: updated };
}

export async function getAttendanceHistory(studentId) {
  const rows = await sheetsService.listRows('Attendance');
  return rows
    .filter((r) => r.StudentId === studentId)
    .map((r) => ({ ...r, Date: normalizeDateOnly(r.Date) }))
    .sort((a, b) => (a.Date < b.Date ? 1 : -1));
}
