import { asyncHandler } from '../../utils/asyncHandler.js';
import * as sheetsService from '../../services/sheets.service.js';
import * as portalService from '../../services/portal.service.js';

export const list = asyncHandler(async (_req, res) => {
  const [attendance, students] = await Promise.all([
    sheetsService.listRows('Attendance'),
    portalService.getAllStudentAccounts(),
  ]);

  const nameById = new Map(students.map((s) => [s.StudentId, s.StudentName]));
  const enriched = attendance
    .map((row) => ({ ...row, StudentName: nameById.get(row.StudentId) || row.StudentId }))
    .sort((a, b) => (a.Date < b.Date ? 1 : -1));

  res.json({ success: true, data: enriched });
});
