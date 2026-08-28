import bcrypt from 'bcryptjs';
import * as sheetsService from './sheets.service.js';
import { compressToDataUrl, dataUrlToBuffer } from '../utils/imageStorage.js';

const BCRYPT_ROUNDS = 10;

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
