import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { ApiError } from './ApiError.js';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

// Google Sheets cells are limited to 50,000 characters. A base64-encoded
// image must stay under that. We resize conservatively and verify after
// encoding.
const MAX_SHEET_CELL_CHARS = 50000;

/**
 * On Vercel: resizes the uploaded image to a WebP data-URL (base64) that is
 * small enough to store in a Google Sheets cell.  Returns a `data:image/webp;base64,…`
 * string.
 *
 * Locally: resizes + converts to a file under uploads/<folder>/ and returns
 * the public path (e.g. /uploads/gallery/uuid.webp).
 */
export async function saveImage(buffer, folder) {
  if (process.env.VERCEL) {
    return saveAsDataUrl(buffer);
  }

  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(filepath);

  return `/uploads/${folder}/${filename}`;
}

/**
 * Converts an image buffer into a base64 data-URL short enough for a Google
 * Sheets cell (≤ 50 000 characters).  Starts at 640 px wide / quality 75 and
 * steps down until it fits.
 */
async function saveAsDataUrl(buffer) {
  const sizes = [
    { width: 640, quality: 75 },
    { width: 480, quality: 70 },
    { width: 320, quality: 65 },
  ];

  for (const { width, quality } of sizes) {
    const webpBuf = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
    const b64 = webpBuf.toString('base64');
    if (b64.length <= MAX_SHEET_CELL_CHARS) {
      return `data:image/webp;base64,${b64}`;
    }
  }

  throw ApiError.badRequest('Image is too large to store. Please use a smaller image.');
}
