import { asyncHandler } from '../../utils/asyncHandler.js';
import * as portalService from '../../services/portal.service.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await portalService.getAllStudentAccounts();
  // Never expose PasswordHash to the admin UI.
  const sanitized = rows.map(({ PasswordHash, ...rest }) => rest);
  res.json({ success: true, data: sanitized });
});
