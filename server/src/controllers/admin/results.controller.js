import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import { v4 as uuid } from 'uuid';
import { isTeacher, scopeRowsToTeacher, assertRowInTeacherScope } from '../../utils/teacherScope.js';

async function findOwn(id) {
  const rows = await sheetsService.listRows('Results');
  return rows.find((r) => r.Id === id);
}

export const list = asyncHandler(async (req, res) => {
  const rows = await sheetsService.listRows('Results');
  res.json({ success: true, data: scopeRowsToTeacher(req, rows) });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.examName || !req.body.className) {
    throw ApiError.badRequest('Exam name and class are required');
  }
  const className = isTeacher(req) ? req.user.className : req.body.className;

  const data = await sheetsService.appendRow('Results', {
    Id: uuid(),
    SubmittedAt: new Date().toISOString(),
    ExamName: req.body.examName,
    ClassName: className,
    Subject: req.body.subject || '',
    ExamDate: req.body.examDate || '',
    Description: req.body.description || '',
    PdfUrl: req.body.pdfUrl || '',
    Published: false,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  if (isTeacher(req)) assertRowInTeacherScope(req, await findOwn(req.params.id));

  const patch = {};
  if (req.body.examName !== undefined) patch.ExamName = req.body.examName;
  if (req.body.className !== undefined && !isTeacher(req)) patch.ClassName = req.body.className;
  if (req.body.subject !== undefined) patch.Subject = req.body.subject;
  if (req.body.examDate !== undefined) patch.ExamDate = req.body.examDate;
  if (req.body.description !== undefined) patch.Description = req.body.description;
  if (req.body.pdfUrl !== undefined) patch.PdfUrl = req.body.pdfUrl;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;

  const data = await sheetsService.updateRow('Results', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  if (isTeacher(req)) assertRowInTeacherScope(req, await findOwn(req.params.id));
  await sheetsService.deleteRow('Results', req.params.id);
  res.json({ success: true });
});
