import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { ApiError } from './ApiError.js';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

/** Resizes + converts an uploaded image buffer to webp and saves it under uploads/<folder>/. Returns the public path (e.g. /uploads/gallery/uuid.webp). */
export async function saveImage(buffer, folder) {
  // Vercel's serverless filesystem is read-only outside /tmp, and /tmp isn't
  // shared or persistent across invocations — a file "saved" here would 404
  // on the very next request. Fail loudly instead of silently losing photos;
  // this needs real cloud storage (e.g. Cloudinary/S3/Vercel Blob) to work
  // on Vercel, which isn't wired up yet.
  if (process.env.VERCEL) {
    throw ApiError.internal(
      'Photo uploads are not available on this deployment yet (no persistent file storage configured). Ask your developer to add cloud storage support.'
    );
  }

  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(filepath);

  return `/uploads/${folder}/${filename}`;
}
