import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { signAppToken } from '../utils/jwt.js';
import * as sheetsService from './sheets.service.js';
import * as portalService from './portal.service.js';
import { sendEmail, admissionApprovedEmail } from './email.service.js';

export async function login(username, password) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH) {
    throw ApiError.internal('Admin account is not configured yet.');
  }
  if (username.trim().toLowerCase() !== env.ADMIN_USERNAME.trim().toLowerCase()) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accessToken = signAppToken({ sub: 'admin', role: 'admin', username: env.ADMIN_USERNAME });
  return { accessToken };
}

/** Approves a PortalApplication: creates a student account and emails credentials. */
export async function approvePortalApplication(applicationId, loginUrl) {
  const applications = await sheetsService.listRows('PortalApplications');
  const application = applications.find((a) => a.Id === applicationId);
  if (!application) throw ApiError.notFound('Application not found');
  if (application.Status === 'Approved') throw ApiError.badRequest('This application has already been approved');

  const { studentId, plainPassword } = await portalService.createStudentAccount({
    applicationId,
    studentName: application.StudentName,
    className: application.ClassName,
    email: application.Email,
    parentPhone: application.ParentPhone,
  });

  await sheetsService.updateRow('PortalApplications', applicationId, { Status: 'Approved' });

  let emailResult = { sent: false };
  if (application.Email) {
    emailResult = await sendEmail({
      to: application.Email,
      subject: 'Your Target Classes Student Portal account is ready',
      html: admissionApprovedEmail({
        studentName: application.StudentName,
        studentCode: studentId,
        tempPassword: plainPassword,
        loginUrl,
      }),
    });
  }

  return { studentId, emailSent: emailResult.sent };
}

export async function rejectPortalApplication(applicationId) {
  await sheetsService.updateRow('PortalApplications', applicationId, { Status: 'Rejected' });
}
