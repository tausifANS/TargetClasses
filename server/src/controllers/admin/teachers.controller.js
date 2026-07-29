import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { saveImage } from '../../utils/imageStorage.js';
import * as sheetsService from '../../services/sheets.service.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('Teachers');
  res.json({ success: true, data: rows });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.position) throw ApiError.badRequest('Name and position are required');
  const photoUrl = req.file ? await saveImage(req.file.buffer, 'teachers') : '';

  const data = await sheetsService.appendRow('Teachers', {
    Name: req.body.name,
    Position: req.body.position,
    Subjects: req.body.subjects || '',
    PhotoUrl: photoUrl,
    DisplayOrder: req.body.displayOrder || '',
    Published: true,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.name !== undefined) patch.Name = req.body.name;
  if (req.body.position !== undefined) patch.Position = req.body.position;
  if (req.body.subjects !== undefined) patch.Subjects = req.body.subjects;
  if (req.body.displayOrder !== undefined) patch.DisplayOrder = req.body.displayOrder;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;
  if (req.file) patch.PhotoUrl = await saveImage(req.file.buffer, 'teachers');

  const data = await sheetsService.updateRow('Teachers', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('Teachers', req.params.id);
  res.json({ success: true });
});
