import { asyncHandler } from '../utils/asyncHandler.js';
import * as userAuthService from '../services/userAuth.service.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await userAuthService.signup({ name, email, password });
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await userAuthService.login({ email, password });
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role } });
});
