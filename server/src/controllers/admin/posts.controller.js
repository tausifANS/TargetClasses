import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { saveImage } from '../../utils/imageStorage.js';
import * as sheetsService from '../../services/sheets.service.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('Posts');
  res.json({ success: true, data: rows });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.body) throw ApiError.badRequest('Title and body are required');
  const imageUrl = req.file ? await saveImage(req.file.buffer, 'posts') : '';
  const data = await sheetsService.appendRow('Posts', {
    Title: req.body.title,
    Body: req.body.body,
    ImageUrl: imageUrl,
    Highlighted: req.body.highlighted === 'true' || req.body.highlighted === true,
    Published: true,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.title !== undefined) patch.Title = req.body.title;
  if (req.body.body !== undefined) patch.Body = req.body.body;
  if (req.body.highlighted !== undefined) patch.Highlighted = req.body.highlighted === 'true' || req.body.highlighted === true;
  if (req.body.published !== undefined) patch.Published = req.body.published === 'true' || req.body.published === true;
  if (req.file) patch.ImageUrl = await saveImage(req.file.buffer, 'posts');

  const data = await sheetsService.updateRow('Posts', req.params.id, patch);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('Posts', req.params.id);
  res.json({ success: true });
});
