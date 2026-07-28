import { asyncHandler } from '../../utils/asyncHandler.js';
import * as adminService from '../../services/admin.service.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { accessToken } = await adminService.login(username, password);
  res.json({ success: true, data: { accessToken } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { username: req.user.username, role: req.user.role } });
});
