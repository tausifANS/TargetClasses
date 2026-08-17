import bcrypt from 'bcryptjs';
import * as sheetsService from './sheets.service.js';
import { ApiError } from '../utils/ApiError.js';
import { signAppToken } from '../utils/jwt.js';

export async function signup({ name, email, password }) {
  const users = await sheetsService.listRows('UserAccounts');
  const existing = users.find((u) => u.Email?.toLowerCase() === email.toLowerCase());
  if (existing) throw ApiError.badRequest('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const data = await sheetsService.appendRow('UserAccounts', {
    Name: name,
    Email: email,
    PasswordHash: passwordHash,
    Status: 'Active',
  });

  const token = signAppToken({ sub: data.id, role: 'user', name, email });
  return { token, user: { id: data.id, name, email } };
}

export async function login({ email, password }) {
  const users = await sheetsService.listRows('UserAccounts');
  const user = users.find((u) => u.Email?.toLowerCase() === email.toLowerCase());
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.Status !== 'Active') throw ApiError.unauthorized('Account is not active');

  const valid = await bcrypt.compare(password, user.PasswordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const token = signAppToken({ sub: user.Id, role: 'user', name: user.Name, email: user.Email });
  return { token, user: { id: user.Id, name: user.Name, email: user.Email } };
}
