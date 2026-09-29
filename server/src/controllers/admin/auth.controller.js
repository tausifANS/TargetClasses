import { asyncHandler } from '../../utils/asyncHandler.js';
import * as adminService from '../../services/admin.service.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { accessToken } = await adminService.login(username, password);
  res.json({ success: true, data: { accessToken } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      username: req.user.username,
      role: req.user.role,
      accountRole: req.user.accountRole === 'teacher' ? 'teacher' : 'admin',
      className: req.user.accountRole === 'teacher' ? req.user.className : null,
      permissions: req.user.accountRole === 'teacher' ? (req.user.permissions || []) : null,
      // The single owner account (env-configured, /admin/login) always signs its token with sub: 'admin'.
      // Accounts created under Admin Accounts get a generated uuid, so this reliably tells them apart.
      isOwner: req.user.sub === 'admin',
    },
  });
});
