import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'));
    }
    cb(null, true);
  },
}).single('image');
