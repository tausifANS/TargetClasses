import * as sheetsService from './sheets.service.js';

const toDateOnly = (value) => String(value ?? '').trim().slice(0, 10);

/**
 * Looks up a single student by Student ID + DOB against the Students sheet.
 * Returns a sanitized record (no internal row Id) or null if no match —
 * deliberately never reveals which field was wrong.
 */
export async function findStudent(studentId, dob) {
  const rows = await sheetsService.listRows('Students');
  const match = rows.find(
    (row) =>
      String(row.StudentId ?? '').trim().toLowerCase() === studentId.trim().toLowerCase() &&
      toDateOnly(row.DOB) === toDateOnly(dob)
  );
  if (!match) return null;

  return {
    studentId: match.StudentId,
    studentName: match.StudentName,
    className: match.ClassName,
    parentName: match.ParentName,
    attendancePercent: match.AttendancePercent,
    feeStatus: match.FeeStatus,
    status: match.Status,
  };
}
