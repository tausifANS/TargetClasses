import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import * as sheetsService from '../../services/sheets.service.js';
import * as adminService from '../../services/admin.service.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('PortalApplications');
  res.json({ success: true, data: rows });
});

export const approve = asyncHandler(async (req, res) => {
  const loginUrl = `${env.CLIENT_URL}/student-portal`;
  const result = await adminService.approvePortalApplication(req.params.id, loginUrl);
  res.json({ success: true, data: result });
});

export const reject = asyncHandler(async (req, res) => {
  await adminService.rejectPortalApplication(req.params.id);
  res.json({ success: true });
});
