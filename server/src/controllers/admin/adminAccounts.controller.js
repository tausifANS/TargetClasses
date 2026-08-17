import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { signAppToken } from '../../utils/jwt.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('AdminAccounts');
  const sanitized = rows.map(({ PasswordHash, ...rest }) => rest);
  res.json({ success: true, data: sanitized });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.username || !req.body.password) {
    throw ApiError.badRequest('Username and password are required');
  }

  const existing = await sheetsService.listRows('AdminAccounts');
  if (existing.some((a) => a.Username?.toLowerCase() === req.body.username.toLowerCase())) {
    throw ApiError.conflict('Username already exists');
  }

  const hash = await bcrypt.hash(req.body.password, 10);
  const data = await sheetsService.appendRow('AdminAccounts', {
    Id: uuid(),
    Username: req.body.username,
    PasswordHash: hash,
    Role: req.body.role || 'admin',
    Active: true,
    CreatedAt: new Date().toISOString(),
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
    (a) => a.Username?.toLowerCase() === req.body.username.toLowerCase() && a.Active === true
  );
  if (!account) throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(req.body.password, account.PasswordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accessToken = signAppToken({ sub: account.Id, role: 'admin', username: account.Username });
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
