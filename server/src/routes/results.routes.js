import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as sheetsService from '../services/sheets.service.js';

const router = Router();

router.get('/:className', asyncHandler(async (req, res) => {
  const rows = await sheetsService.listRows('Results', { onlyPublished: true });
  const filtered = rows.filter((r) => r.ClassName === req.params.className);
  res.json({ success: true, data: filtered });
}));

export default router;
