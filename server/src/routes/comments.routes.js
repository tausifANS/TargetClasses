import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as sheetsService from '../services/sheets.service.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const router = Router();

router.get('/:resourceType/:resourceId', asyncHandler(async (req, res) => {
  const all = await sheetsService.listRows('Comments');
  const filtered = all.filter(
    (c) =>
      c.ResourceType === req.params.resourceType &&
      c.ResourceId === req.params.resourceId &&
      c.Published !== false
  );
  res.json({ success: true, data: filtered });
}));

router.post('/:resourceType/:resourceId', asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.comment) {
    throw ApiError.badRequest('Name and comment are required');
  }

  const data = await sheetsService.appendRow('Comments', {
    Id: uuid(),
    SubmittedAt: new Date().toISOString(),
    ResourceType: req.params.resourceType,
    ResourceId: req.params.resourceId,
    Name: req.body.name,
    Comment: req.body.comment,
    Published: true,
  });
  res.status(201).json({ success: true, data });
}));

router.get('/:resourceType/:resourceId/likes', asyncHandler(async (req, res) => {
  const all = await sheetsService.listRows('Likes');
  const filtered = all.filter(
    (l) => l.ResourceType === req.params.resourceType && l.ResourceId === req.params.resourceId
  );
  const visitorHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').slice(0, 16);
  const liked = filtered.some((l) => l.VisitorHash === visitorHash);
  res.json({ success: true, data: { count: filtered.length, liked } });
}));

router.post('/:resourceType/:resourceId/likes', asyncHandler(async (req, res) => {
  const visitorHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').slice(0, 16);
  const all = await sheetsService.listRows('Likes');
  const existing = all.find(
    (l) =>
      l.ResourceType === req.params.resourceType &&
      l.ResourceId === req.params.resourceId &&
      l.VisitorHash === visitorHash
  );

  if (existing) {
    await sheetsService.deleteRow('Likes', existing.Id);
    const remaining = all.filter(
      (l) =>
        l.ResourceType === req.params.resourceType &&
        l.ResourceId === req.params.resourceId &&
        l.Id !== existing.Id
    );
    res.json({ success: true, data: { count: remaining.length, liked: false } });
  } else {
    await sheetsService.appendRow('Likes', {
      Id: uuid(),
      ResourceType: req.params.resourceType,
      ResourceId: req.params.resourceId,
      VisitorHash: visitorHash,
      SubmittedAt: new Date().toISOString(),
    });
    const count = all.filter(
      (l) => l.ResourceType === req.params.resourceType && l.ResourceId === req.params.resourceId
    ).length + 1;
    res.json({ success: true, data: { count, liked: true } });
  }
}));

export default router;
