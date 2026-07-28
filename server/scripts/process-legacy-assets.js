/**
 * One-off import: takes the raw phone photos/videos dropped in the project
 * root and produces (a) a clean archive under /assets/originals, and
 * (b) optimized, responsively-sized WebP images under /client/public/images
 * ready for the website. Re-run safely — it always overwrites its outputs.
 *
 * Usage: node scripts/process-legacy-assets.js   (run from /server)
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../'); // "Target Classes" project root
const PUBLIC_IMAGES = path.join(ROOT, 'client/public/images');
const PUBLIC_VIDEOS = path.join(ROOT, 'client/public/videos');
const ARCHIVE = path.join(ROOT, 'assets/originals');

const SIZES = { thumb: 400, md: 800, lg: 1600 };

/** category -> list of { src, out, caption } */
const GALLERY_MANIFEST = {
  'gallery/events': [
    { src: 'Nursury1.jpeg', out: 'diwali-01', caption: 'Diwali celebration — rangoli & diya lighting' },
    { src: 'Nursury2.jpeg', out: 'diwali-02', caption: 'Diwali celebration with class teachers' },
    { src: 'Nursury3.jpeg', out: 'diwali-03', caption: 'Diwali diya craft — Nursery batch' },
    { src: 'Nursury4.jpeg', out: 'diwali-04', caption: 'Diwali diya craft — Nursery batch' },
    { src: 'Nursury5.jpeg', out: 'diwali-05', caption: 'Diwali diya craft — Nursery batch' },
    { src: 'Nursury8.jpeg', out: 'diwali-06', caption: 'Diwali diya craft — Nursery batch' },
    { src: 'WhatsApp Image 2026-07-13 at 10.26.15 PM.jpeg', out: 'annual-function-01', caption: 'Annual function — student gathering' },
    { src: 'WhatsApp Image 2026-07-13 at 10.46.25 PM.jpeg', out: 'annual-function-02', caption: 'Annual function — student gathering' },
    { src: 'WhatsApp Image 2026-07-13 at 10.46.27 PM.jpeg', out: 'annual-function-03', caption: 'Annual function — student gathering' },
    { src: 'WhatsApp Image 2026-07-13 at 10.52.01 PM.jpeg', out: 'world-environment-day', caption: 'World Environment Day — plantation drive & award' },
  ],
  'gallery/classroom': [
    { src: 'Nursury9.jpeg', out: 'classroom-01', caption: 'Classroom activity day' },
    { src: 'Nursury10.jpeg', out: 'classroom-02', caption: 'Classroom activity day' },
  ],
  'gallery/topper': [
    { src: 'Reward.jpeg', out: 'achievement-01', caption: 'Student recognition & reward ceremony' },
    { src: 'Sanjay4.jpeg', out: 'achievement-02', caption: 'Student recognition & reward ceremony' },
  ],
};

/** Faculty headshots need a manual crop box (pixels, in the SOURCE image) because
 * these are candid phone photos, not studio portraits — auto-crop would frame them badly. */
const FACULTY_MANIFEST = [
  {
    src: 'Sanjay sir1.jpeg',
    out: 'sanjay-biology',
    crop: { left: 480, top: 190, width: 480, height: 480 },
  },
  {
    src: 'Abdul Samad Ansari.jpeg',
    out: 'abdul-samad-english',
    crop: { left: 490, top: 320, width: 380, height: 380 },
  },
];

const VIDEO_MANIFEST = [
  { src: 'WhatsApp Video 2026-07-13 at 10.40.50 PM.mp4', out: 'video-01.mp4' },
  { src: 'WhatsApp Video 2026-07-13 at 10.41.03 PM.mp4', out: 'video-02.mp4' },
  { src: 'WhatsApp Video 2026-07-13 at 10.41.16 PM.mp4', out: 'video-03.mp4' },
  { src: 'WhatsApp Video 2026-07-13 at 10.41.20 PM.mp4', out: 'video-04.mp4' },
];

// Duplicates confirmed by checksum — archived under their first-seen name only.
const SKIP_AS_DUPLICATE = new Set([
  'Nursury6.jpeg', // == Nursury4.jpeg
  'Nursury7.jpeg', // == Nursury3.jpeg
  'WhatsApp Image 2026-07-13 at 10.46.25 PM (1).jpeg', // == the non-"(1)" file
]);

// Excluded from the public site (unclear identity / off-brand background) but kept in the archive.
const EXCLUDE_FROM_SITE = new Set([
  'Abdul Samad Ansari 2.jpeg',
  'sanjay 2.jpeg',
  'WhatsApp Image 2026-07-13 at 10.39.08 PM.jpeg',
]);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function archiveOriginals() {
  await ensureDir(ARCHIVE);
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && /\.(jpe?g|png|mp4)$/i.test(e.name));
  for (const f of files) {
    if (SKIP_AS_DUPLICATE.has(f.name)) continue;
    await fs.copyFile(path.join(ROOT, f.name), path.join(ARCHIVE, f.name));
  }
  console.log(`Archived ${files.length - SKIP_AS_DUPLICATE.size} unique original(s) -> assets/originals/`);
}

async function processGallery() {
  for (const [category, items] of Object.entries(GALLERY_MANIFEST)) {
    const outDir = path.join(PUBLIC_IMAGES, category);
    await ensureDir(outDir);
    for (const item of items) {
      const srcPath = path.join(ROOT, item.src);
      for (const [sizeName, width] of Object.entries(SIZES)) {
        await sharp(srcPath)
          .resize({ width, withoutEnlargement: true })
          .rotate() // apply EXIF orientation
          .webp({ quality: 82 })
          .toFile(path.join(outDir, `${item.out}-${sizeName}.webp`));
      }
      console.log(`✓ ${category}/${item.out} (3 sizes)`);
    }
  }
}

async function processFaculty() {
  const outDir = path.join(PUBLIC_IMAGES, 'faculty');
  await ensureDir(outDir);
  for (const t of FACULTY_MANIFEST) {
    const srcPath = path.join(ROOT, t.src);
    const base = sharp(srcPath).rotate().extract(t.crop);
    await base.clone().resize(500, 500).sharpen().webp({ quality: 85 }).toFile(path.join(outDir, `${t.out}.webp`));
    await base.clone().resize(160, 160).sharpen().webp({ quality: 85 }).toFile(path.join(outDir, `${t.out}-thumb.webp`));
    console.log(`✓ faculty/${t.out} (cropped + optimized)`);
  }
}

async function copyVideos() {
  await ensureDir(PUBLIC_VIDEOS);
  for (const v of VIDEO_MANIFEST) {
    await fs.copyFile(path.join(ROOT, v.src), path.join(PUBLIC_VIDEOS, v.out));
    console.log(`✓ videos/${v.out} (copied as-is — no ffmpeg available to compress/transcode)`);
  }
}

async function main() {
  console.log('Processing legacy assets from:', ROOT);
  await archiveOriginals();
  await processGallery();
  await processFaculty();
  await copyVideos();
  console.log('\nDone. Note: faculty photos for Naushad Ansari and Shahnawaz have no source');
  console.log('image and use a generated placeholder — see client/public/brand/faculty-placeholder-*.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
