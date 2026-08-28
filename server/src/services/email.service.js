import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import * as settingsService from './settings.service.js';

/**
 * SMTP credentials come from the Settings sheet first (admin-editable from
 * the Admin Portal, so a Gmail App Password can be rotated without a code
 * deploy), falling back to the server/.env values set at deploy time. A
 * fresh transporter is built per send — nodemailer connects per-message
 * anyway at this volume, and it means a password rotation takes effect on
 * the very next email instead of needing a server restart.
 */
async function getTransporter() {
  const [host, port, user, pass] = await Promise.all([
    settingsService.getSetting('SMTP_HOST', env.SMTP_HOST),
    settingsService.getSetting('SMTP_PORT', env.SMTP_PORT),
    settingsService.getSetting('SMTP_USER', env.SMTP_USER),
    settingsService.getSetting('SMTP_PASS', env.SMTP_PASS),
  ]);

  if (!user || !pass) return null;

  const numericPort = Number(port) || 587;
  return nodemailer.createTransport({
    host,
    port: numericPort,
    secure: numericPort === 465,
    auth: { user, pass },
  });
}

/**
 * Sends an email if SMTP credentials are configured; otherwise logs the
 * would-be email so local development never hard-fails on a missing
 * SMTP_PASS (a Gmail App Password has to be generated separately).
 */
export async function sendEmail({ to, subject, html }) {
  const t = await getTransporter();
  if (!t) {
    logger.warn(`SMTP not configured — skipping email to ${to}: "${subject}"`);
    return { sent: false };
  }
  const from = (await settingsService.getSetting('SMTP_FROM', env.SMTP_FROM)) || (await settingsService.getSetting('SMTP_USER', env.SMTP_USER));
  try {
    await t.sendMail({ from, to, subject, html });
    return { sent: true };
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

export function passwordResetEmail(resetUrl) {
  return `
    <div style="font-family:Poppins,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#16305C">Reset your Target Classes password</h2>
      <p>We received a request to reset your password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}" style="background:#16305C;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
      <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}

export function admissionApprovedEmail({ studentName, studentCode, tempPassword, loginUrl }) {
  return `
    <div style="font-family:Poppins,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#16305C">Congratulations, ${studentName}! 🎉</h2>
      <p>Your admission to <strong>Target Classes</strong> has been approved.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#666">Student ID</td><td style="font-weight:600">${studentCode}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Temporary Password</td><td style="font-weight:600">${tempPassword}</td></tr>
      </table>
      <p><a href="${loginUrl}" style="background:#16305C;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Open Student Portal</a></p>
      <p style="color:#666;font-size:13px">On your first login you'll be asked to set a new password. Keep your Student ID safe — you'll use it to log in going forward.</p>
    </div>`;
}
