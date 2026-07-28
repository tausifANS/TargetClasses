import { asyncHandler } from '../../utils/asyncHandler.js';
import * as sheetsService from '../../services/sheets.service.js';

const INBOX_SHEETS = new Set(['Admissions', 'ContactMessages', 'SupportRequests', 'CareerApplications']);

function assertKnownSheet(sheetParam) {
  if (!INBOX_SHEETS.has(sheetParam)) {
    const err = new Error('Unknown inbox');
    err.statusCode = 404;
    throw err;
  }
}

export const list = asyncHandler(async (req, res) => {
  assertKnownSheet(req.params.sheet);
  const rows = await sheetsService.listRows(req.params.sheet);
  res.json({ success: true, data: rows });
});

export const updateStatus = asyncHandler(async (req, res) => {
  assertKnownSheet(req.params.sheet);
  const data = await sheetsService.updateRow(req.params.sheet, req.params.id, { Status: req.body.status });
  res.json({ success: true, data });
});
