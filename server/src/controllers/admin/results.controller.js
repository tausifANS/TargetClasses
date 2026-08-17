import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import { v4 as uuid } from 'uuid';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('Results');
  res.json({ success: true, data: rows });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.studentName || !req.body.className) {
    throw ApiError.badRequest('Student name and class are required');
  }

  const data = await sheetsService.appendRow('Results', {
    Id: uuid(),
    SubmittedAt: new Date().toISOString(),
    StudentName: req.body.studentName,
    ClassName: req.body.className,
    Subject: req.body.subject || '',
    Marks: req.body.marks || '',
    TotalMarks: req.body.totalMarks || '',
    ExamName: req.body.examName || '',
    Term: req.body.term || '',
    Published: false,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.studentName !== undefined) patch.StudentName = req.body.studentName;
  if (req.body.className !== undefined) patch.ClassName = req.body.className;
  if (req.body.subject !== undefined) patch.Subject = req.body.subject;
  if (req.body.marks !== undefined) patch.Marks = req.body.marks;
  if (req.body.totalMarks !== undefined) patch.TotalMarks = req.body.totalMarks;
  if (req.body.examName !== undefined) patch.ExamName = req.body.examName;
  if (req.body.term !== undefined) patch.Term = req.body.term;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;

  const data = await sheetsService.updateRow('Results', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('Results', req.params.id);
  res.json({ success: true });
});
