import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as sheetsService from '../services/sheets.service.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const router = Router();

// GET comments for a post
router.get('/:targetType/:targetId', asyncHandler(async (req, res) => {
  const all = await sheetsService.listRows('Comments');
  const filtered = all.filter(
    (c) =>
      c.TargetType === req.params.targetType &&
      c.TargetId === req.params.targetId &&
      c.Published !== false
  );
  res.json({ success: true, data: filtered });
}));

// POST a comment
router.post('/:targetType/:targetId', asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.text) {
    throw ApiError.badRequest('Name and text are required');
  }

  await sheetsService.appendRow('Comments', {
    TargetType: req.params.targetType,
    TargetId: req.params.targetId,
    StudentId: req.body.studentId || '',
    StudentName: req.body.name,
    Text: req.body.text,
    Published: true,
  });
  res.status(201).json({ success: true });
}));

// DELETE a comment (admin only)
router.delete('/:id', asyncHandler(async (req, res) => {
  await sheetsService.deleteRow('Comments', req.params.id);
  res.json({ success: true });
}));

// GET like count + whether current visitor liked
router.get('/:targetType/:targetId/likes', asyncHandler(async (req, res) => {
  const all = await sheetsService.listRows('Likes');
  const filtered = all.filter(
    (l) => l.TargetType === req.params.targetType && l.TargetId === req.params.targetId
  );
  const visitorHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').slice(0, 16);
  const liked = filtered.some((l) => l.VisitorHash === visitorHash);
  res.json({ success: true, data: { count: filtered.length, liked } });
}));

// POST toggle like
router.post('/:targetType/:targetId/likes', asyncHandler(async (req, res) => {
  const visitorHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').slice(0, 16);
  const all = await sheetsService.listRows('Likes');
  const existing = all.find(
    (l) =>
      l.TargetType === req.params.targetType &&
      l.TargetId === req.params.targetId &&
      l.VisitorHash === visitorHash
  );

  if (existing) {
    await sheetsService.deleteRow('Likes', existing.Id);
    const remaining = all.filter(
      (l) =>
        l.TargetType === req.params.targetType &&
        l.TargetId === req.params.targetId &&
        l.Id !== existing.Id
    );
    res.json({ success: true, data: { count: remaining.length, liked: false } });
  } else {
    await sheetsService.appendRow('Likes', {
      TargetType: req.params.targetType,
      TargetId: req.params.targetId,
      VisitorHash: visitorHash,
    });
    const count = all.filter(
      (l) => l.TargetType === req.params.targetType && l.TargetId === req.params.targetId
    ).length + 1;
    res.json({ success: true, data: { count, liked: true } });
  }
}));

export default router;
