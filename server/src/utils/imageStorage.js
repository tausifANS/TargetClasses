import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

/** Resizes + converts an uploaded image buffer to webp and saves it under uploads/<folder>/. Returns the public path (e.g. /uploads/gallery/uuid.webp). */
export async function saveImage(buffer, folder) {
  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(filepath);

  return `/uploads/${folder}/${filename}`;
}
