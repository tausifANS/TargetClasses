import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function assertConfigured() {
  if (!env.GOOGLE_SHEETS_WEBAPP_URL || !env.GOOGLE_SHEETS_API_SECRET) {
    throw ApiError.internal('Google Sheets integration is not configured yet.');
  }
}

export async function appendRow(sheetName, row) {
  assertConfigured();
  const res = await fetch(env.GOOGLE_SHEETS_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.GOOGLE_SHEETS_API_SECRET, sheet: sheetName, row }),
  });
  const data = await res.json().catch(() => null);
  if (!data?.success) {
    throw ApiError.internal(data?.message || 'Failed to save to Google Sheets');
  }
  return data.data;
}

export async function listRows(sheetName, { onlyPublished = false } = {}) {
  assertConfigured();
  const url = new URL(env.GOOGLE_SHEETS_WEBAPP_URL);
  url.searchParams.set('secret', env.GOOGLE_SHEETS_API_SECRET);
  url.searchParams.set('sheet', sheetName);
  if (onlyPublished) url.searchParams.set('onlyPublished', 'true');

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => null);
  if (!data?.success) {
    throw ApiError.internal(data?.message || 'Failed to read from Google Sheets');
  }
  return data.data;
}
