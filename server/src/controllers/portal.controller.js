import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signAppToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import * as portalService from '../services/portal.service.js';
import * as sheetsService from '../services/sheets.service.js';
import { sendEmail, passwordResetEmail } from '../services/email.service.js';

export const login = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;
  const student = await portalService.authenticateStudent(studentId, password);

  if (!student) {
    throw ApiError.unauthorized('Invalid Student ID or password');
  }

  const accessToken = signAppToken({
    sub: student.studentId,
    role: 'student',
    studentId: student.studentId,
    className: student.className,
  });

  res.json({ success: true, data: { accessToken, student } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const result = await portalService.createPasswordResetToken(studentId);

  // Always respond the same way — never reveal whether the Student ID exists.
  if (result?.account?.Email) {
    const resetUrl = `${env.CLIENT_URL}/student-portal?resetToken=${result.rawToken}`;
    await sendEmail({
      to: result.account.Email,
      subject: 'Reset your Target Classes Student Portal password',
      html: passwordResetEmail(resetUrl),
    });
  }

  res.json({ success: true, message: 'If that Student ID exists, a reset link has been emailed to the address on file.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await portalService.resetPasswordWithToken(token, newPassword);
  res.json({ success: true, message: 'Password reset — you can now log in with your new password.' });
});

export const me = asyncHandler(async (req, res) => {
  const account = await portalService.findStudentAccountByStudentId(req.user.studentId);
  if (!account) throw ApiError.notFound('Student account not found');
  res.json({ success: true, data: portalService.sanitizeAccount(account) });
});

export const punchIn = asyncHandler(async (req, res) => {
  const photo = req.body.photo || '';
  const result = await portalService.punchIn(req.user.studentId, photo);
  if (result.alreadyPunched) {
    return res.json({ success: true, message: 'Already punched in today', data: result.record });
  }
  res.status(201).json({ success: true, message: 'Punched in', data: result.record });
});

export const punchOut = asyncHandler(async (req, res) => {
  const result = await portalService.punchOut(req.user.studentId);
  if (result.noPunchIn) throw ApiError.badRequest('You need to punch in before you can punch out');
  if (result.alreadyPunchedOut) {
    return res.json({ success: true, message: 'Already punched out today', data: result.record });
  }
  res.json({ success: true, message: 'Punched out', data: result.record });
});

export const attendanceHistory = asyncHandler(async (req, res) => {
  const rows = await portalService.getAttendanceHistory(req.user.studentId);
  res.json({ success: true, data: rows });
});

export const classes = asyncHandler(async (req, res) => {
  const rows = await sheetsService.listRows('Classes', { onlyPublished: true });
  // Compared as strings — Google Sheets silently stores a numeric-looking class name (e.g. "10")
  // as an actual number, which would otherwise never match the student's (always-string) className.
  const mine = rows.filter((c) => String(c.ClassName) === String(req.user.className));
  res.json({ success: true, data: mine });
});
