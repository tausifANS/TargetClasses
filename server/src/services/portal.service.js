import bcrypt from 'bcryptjs';
import * as sheetsService from './sheets.service.js';

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

export async function getTodayAttendance(studentId) {
  const rows = await sheetsService.listRows('Attendance');
  const today = todayDateOnly();
  return rows.find((r) => r.StudentId === studentId && r.Date === today) || null;
}

export async function punchIn(studentId, photo) {
  const existing = await getTodayAttendance(studentId);
  if (existing) return { alreadyPunched: true, record: existing };

  const record = await sheetsService.appendRow('Attendance', {
    StudentId: studentId,
    Date: todayDateOnly(),
    PunchIn: new Date().toISOString(),
    PunchOut: '',
    PhotoUrl: photo || '',
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
    .sort((a, b) => (a.Date < b.Date ? 1 : -1));
}
