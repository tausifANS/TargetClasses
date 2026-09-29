import { asyncHandler } from '../../utils/asyncHandler.js';
import * as sheetsService from '../../services/sheets.service.js';
import * as portalService from '../../services/portal.service.js';
import { scopeRowsToTeacher } from '../../utils/teacherScope.js';

export const list = asyncHandler(async (req, res) => {
  const [attendance, students] = await Promise.all([
    sheetsService.listRows('Attendance'),
    portalService.getAllStudentAccounts(),
  ]);

  const studentById = new Map(students.map((s) => [s.StudentId, s]));
  const enriched = attendance
    .map((row) => {
      const student = studentById.get(row.StudentId);
      return {
        ...row,
        StudentName: student?.StudentName || row.StudentId,
        ClassName: student?.ClassName,
        Date: portalService.normalizeDateOnly(row.Date),
      };
    })
    .sort((a, b) => (a.Date < b.Date ? 1 : -1));

  res.json({ success: true, data: scopeRowsToTeacher(req, enriched) });
});
