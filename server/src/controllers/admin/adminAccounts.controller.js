import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { signAppToken } from '../../utils/jwt.js';
import { TEACHER_PAGES } from '../../utils/teacherScope.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('AdminAccounts');
  const sanitized = rows.map(({ PasswordHash, Permissions, ...rest }) => ({
    ...rest,
    Permissions: Permissions ? String(Permissions).split(',').filter(Boolean) : [],
  }));
  res.json({ success: true, data: sanitized });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.username || !req.body.password) {
    throw ApiError.badRequest('Username and password are required');
  }
  const role = req.body.role || 'admin';
  if (role === 'teacher' && !req.body.className) {
    throw ApiError.badRequest('A batch/class is required for a teacher account');
  }

  const existing = await sheetsService.listRows('AdminAccounts');
  if (existing.some((a) => a.Username?.toLowerCase() === req.body.username.toLowerCase())) {
    throw ApiError.conflict('Username already exists');
  }

  const permissions = role === 'teacher'
    ? (Array.isArray(req.body.permissions) ? req.body.permissions : []).filter((p) => TEACHER_PAGES.includes(p))
    : [];

  const hash = await bcrypt.hash(req.body.password, 10);
  const data = await sheetsService.appendRow('AdminAccounts', {
    Id: uuid(),
    Username: req.body.username,
    PasswordHash: hash,
    Role: role,
    Status: 'Active',
    ClassName: role === 'teacher' ? req.body.className : '',
    Permissions: permissions.join(','),
  });
  res.status(201).json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('AdminAccounts', req.params.id);
  res.json({ success: true });
});

export const loginWithAccount = asyncHandler(async (req, res) => {
  const accounts = await sheetsService.listRows('AdminAccounts');
  const account = accounts.find(
    (a) => a.Username?.toLowerCase() === req.body.username.toLowerCase() && a.Status === 'Active'
  );
  if (!account) throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(req.body.password, account.PasswordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accountRole = account.Role === 'teacher' ? 'teacher' : 'admin';
  const accessToken = signAppToken({
    sub: account.Id,
    role: 'admin', // grants the same route-level access as the owner account; scoping happens via accountRole below
    username: account.Username,
    accountRole,
    className: accountRole === 'teacher' ? account.ClassName : null,
    permissions: accountRole === 'teacher' ? String(account.Permissions || '').split(',').filter(Boolean) : null,
  });
  res.json({ success: true, data: { accessToken } });
});

export const changePassword = asyncHandler(async (req, res) => {
  if (!req.body.currentPassword || !req.body.newPassword) {
    throw ApiError.badRequest('Current and new password are required');
  }

  const accounts = await sheetsService.listRows('AdminAccounts');
  const account = accounts.find(
    (a) => a.Username?.toLowerCase() === req.user?.username?.toLowerCase()
  );
  if (!account) throw ApiError.notFound('Admin account not found');

  const valid = await bcrypt.compare(req.body.currentPassword, account.PasswordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  const newHash = await bcrypt.hash(req.body.newPassword, 10);
  await sheetsService.updateRow('AdminAccounts', account.Id, { PasswordHash: newHash });
  res.json({ success: true, message: 'Password updated successfully' });
});
