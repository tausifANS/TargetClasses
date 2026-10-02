import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import { v4 as uuid } from 'uuid';
import { isTeacher, scopeRowsToTeacher, assertRowInTeacherScope } from '../../utils/teacherScope.js';

async function findOwn(id) {
  const rows = await sheetsService.listRows('Notes');
  return rows.find((r) => r.Id === id);
}

export const list = asyncHandler(async (req, res) => {
  const rows = await sheetsService.listRows('Notes');
  res.json({ success: true, data: scopeRowsToTeacher(req, rows) });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.className || !req.body.fileUrl) {
    throw ApiError.badRequest('Title, class, and file URL are required');
  }
  const className = isTeacher(req) ? req.user.className : req.body.className;

  const data = await sheetsService.appendRow('Notes', {
    Id: uuid(),
    SubmittedAt: new Date().toISOString(),
    Title: req.body.title,
    ClassName: className,
    Subject: req.body.subject || '',
    PdfUrl: req.body.fileUrl,
    Published: false,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  if (isTeacher(req)) assertRowInTeacherScope(req, await findOwn(req.params.id));

  const patch = {};
  if (req.body.title !== undefined) patch.Title = req.body.title;
  if (req.body.className !== undefined && !isTeacher(req)) patch.ClassName = req.body.className;
  if (req.body.subject !== undefined) patch.Subject = req.body.subject;
  if (req.body.fileUrl !== undefined) patch.PdfUrl = req.body.fileUrl;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;

  const data = await sheetsService.updateRow('Notes', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  if (isTeacher(req)) assertRowInTeacherScope(req, await findOwn(req.params.id));
  await sheetsService.deleteRow('Notes', req.params.id);
  res.json({ success: true });
});
