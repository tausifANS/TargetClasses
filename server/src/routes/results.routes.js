import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as sheetsService from '../services/sheets.service.js';

const router = Router();

// className is a query param (matches the Student Portal's actual call shape). Compared as a
// string on both sides since Google Sheets silently stores a numeric-looking class name (e.g.
// "10") as a number, which would otherwise fail a strict equality check against the URL param.
router.get('/', asyncHandler(async (req, res) => {
  const rows = await sheetsService.listRows('Results', { onlyPublished: true });
  const filtered = rows.filter((r) => String(r.ClassName) === String(req.query.className));
  res.json({ success: true, data: filtered });
}));

export default router;
