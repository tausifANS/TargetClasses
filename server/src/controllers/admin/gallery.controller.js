import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { saveImage } from '../../utils/imageStorage.js';
import * as sheetsService from '../../services/sheets.service.js';

export const list = asyncHandler(async (_req, res) => {
  const rows = await sheetsService.listRows('GalleryItems');
  res.json({ success: true, data: rows });
});

export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file uploaded');
  const imageUrl = await saveImage(req.file.buffer, 'gallery');

  const data = await sheetsService.appendRow('GalleryItems', {
    Category: req.body.category || 'general',
    ImageUrl: imageUrl,
    Caption: req.body.caption || '',
    Published: true,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await sheetsService.updateRow('GalleryItems', req.params.id, req.body);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('GalleryItems', req.params.id);
  res.json({ success: true });
});
