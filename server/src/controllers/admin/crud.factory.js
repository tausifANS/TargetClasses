import { asyncHandler } from '../../utils/asyncHandler.js';
import * as sheetsService from '../../services/sheets.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { isTeacher, scopeRowsToTeacher, assertRowInTeacherScope } from '../../utils/teacherScope.js';

/**
 * Generic admin CRUD over a Google Sheets tab — list (all rows, incl. unpublished), create, update, delete.
 * Pass `{ classScoped: true }` for sheets with a ClassName column that a teacher account should only see/edit
 * rows within their own assigned batch (the row's ClassName is forced server-side on create, ignoring the client).
 */
export function makeCrudController(sheetName, { classScoped = false } = {}) {
  return {
    list: asyncHandler(async (req, res) => {
      const rows = await sheetsService.listRows(sheetName);
      res.json({ success: true, data: classScoped ? scopeRowsToTeacher(req, rows) : rows });
    }),
    create: asyncHandler(async (req, res) => {
      const body = classScoped && isTeacher(req) ? { ...req.body, ClassName: req.user.className } : req.body;
      const data = await sheetsService.appendRow(sheetName, body);
      res.status(201).json({ success: true, data });
    }),
    update: asyncHandler(async (req, res) => {
      if (classScoped && isTeacher(req)) {
        const rows = await sheetsService.listRows(sheetName);
        const existing = rows.find((r) => r.Id === req.params.id);
        if (!existing) throw ApiError.notFound('Not found');
        assertRowInTeacherScope(req, existing);
      }
      const data = await sheetsService.updateRow(sheetName, req.params.id, req.body);
      res.json({ success: true, data });
    }),
    remove: asyncHandler(async (req, res) => {
      if (classScoped && isTeacher(req)) {
        const rows = await sheetsService.listRows(sheetName);
        const existing = rows.find((r) => r.Id === req.params.id);
        if (!existing) throw ApiError.notFound('Not found');
        assertRowInTeacherScope(req, existing);
      }
      await sheetsService.deleteRow(sheetName, req.params.id);
      res.json({ success: true });
    }),
  };
}
