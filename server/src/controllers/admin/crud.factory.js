import { asyncHandler } from '../../utils/asyncHandler.js';
import * as sheetsService from '../../services/sheets.service.js';

/** Generic admin CRUD over a Google Sheets tab — list (all rows, incl. unpublished), create, update, delete. */
export function makeCrudController(sheetName) {
  return {
    list: asyncHandler(async (_req, res) => {
      const rows = await sheetsService.listRows(sheetName);
      res.json({ success: true, data: rows });
    }),
    create: asyncHandler(async (req, res) => {
      const data = await sheetsService.appendRow(sheetName, req.body);
      res.status(201).json({ success: true, data });
    }),
    update: asyncHandler(async (req, res) => {
      const data = await sheetsService.updateRow(sheetName, req.params.id, req.body);
      res.json({ success: true, data });
    }),
    remove: asyncHandler(async (req, res) => {
      await sheetsService.deleteRow(sheetName, req.params.id);
      res.json({ success: true });
    }),
  };
}
