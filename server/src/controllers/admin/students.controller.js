import { asyncHandler } from '../../utils/asyncHandler.js';
import * as portalService from '../../services/portal.service.js';
import { scopeRowsToTeacher } from '../../utils/teacherScope.js';

export const list = asyncHandler(async (req, res) => {
  const rows = await portalService.getAllStudentAccounts();
  // Never expose PasswordHash to the admin UI.
  const sanitized = rows.map(({ PasswordHash, ...rest }) => rest);
  res.json({ success: true, data: scopeRowsToTeacher(req, sanitized) });
});
