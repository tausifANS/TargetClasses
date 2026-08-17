import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as sheetsService from '../../services/sheets.service.js';
import { v4 as uuid } from 'uuid';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('Questions');
  res.json({ success: true, data: rows });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.type || !req.body.className) {
    throw ApiError.badRequest('Title, type, and class are required');
  }

  const data = await sheetsService.appendRow('Questions', {
    Id: uuid(),
    SubmittedAt: new Date().toISOString(),
    Title: req.body.title,
    Type: req.body.type,
    Options: req.body.options || '',
    Answer: req.body.answer || '',
    ClassName: req.body.className,
    Subject: req.body.subject || '',
    Published: false,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.title !== undefined) patch.Title = req.body.title;
  if (req.body.type !== undefined) patch.Type = req.body.type;
  if (req.body.options !== undefined) patch.Options = req.body.options;
  if (req.body.answer !== undefined) patch.Answer = req.body.answer;
  if (req.body.className !== undefined) patch.ClassName = req.body.className;
  if (req.body.subject !== undefined) patch.Subject = req.body.subject;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;

  const data = await sheetsService.updateRow('Questions', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('Questions', req.params.id);
  res.json({ success: true });
});
