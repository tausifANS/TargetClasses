import { asyncHandler } from '../utils/asyncHandler.js';
import * as sheetsService from '../services/sheets.service.js';

const publicList = (sheetName) =>
  asyncHandler(async (_req, res) => {
    const rows = await sheetsService.listRows(sheetName, { onlyPublished: true });
    res.json({ success: true, data: rows });
  });

export const getTestimonials = publicList('Testimonials');
export const getNotices = publicList('Notices');
export const getEvents = publicList('Events');
export const getToppers = publicList('Toppers');
export const getPosts = publicList('Posts');
export const getGalleryItems = publicList('GalleryItems');
export const getTeachers = publicList('Teachers');
