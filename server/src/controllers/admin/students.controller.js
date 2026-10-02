import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import * as portalService from '../../services/portal.service.js';
import { sendEmail, studentCredentialsEmail } from '../../services/email.service.js';
import { scopeRowsToTeacher, assertRowInTeacherScope } from '../../utils/teacherScope.js';

export const list = asyncHandler(async (req, res) => {
  const rows = await portalService.getAllStudentAccounts();
  // Never expose PasswordHash to the admin UI.
  const sanitized = rows.map(({ PasswordHash, ...rest }) => rest);
  res.json({ success: true, data: scopeRowsToTeacher(req, sanitized) });
});

/** Admin/teacher sets or regenerates a student's password — for when the approval email never arrived. */
export const resetPassword = asyncHandler(async (req, res) => {
  const account = await portalService.findStudentAccountByStudentId(req.params.studentId);
  if (!account) throw ApiError.notFound('Student account not found');
  assertRowInTeacherScope(req, account);

  const customPassword = req.body.password?.trim() || undefined;
  if (customPassword && customPassword.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters');
  }

  const { plainPassword } = await portalService.adminResetStudentPassword(req.params.studentId, customPassword);

  let emailSent = false;
  if (req.body.sendEmail && account.Email) {
    const loginUrl = `${env.CLIENT_URL}/student-portal`;
    const result = await sendEmail({
      to: account.Email,
      subject: 'Your Target Classes Student Portal login details',
      html: studentCredentialsEmail({ studentName: account.StudentName, studentCode: account.StudentId, tempPassword: plainPassword, loginUrl }),
    });
    emailSent = result.sent;
  }

  res.json({ success: true, data: { password: plainPassword, emailSent } });
});
