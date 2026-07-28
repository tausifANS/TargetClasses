import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function assertConfigured() {
  if (!env.GOOGLE_SHEETS_WEBAPP_URL || !env.GOOGLE_SHEETS_API_SECRET) {
    throw ApiError.internal('Google Sheets integration is not configured yet.');
  }
}

async function postToSheets(body) {
  assertConfigured();
  const res = await fetch(env.GOOGLE_SHEETS_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.GOOGLE_SHEETS_API_SECRET, ...body }),
  });
  const data = await res.json().catch(() => null);
  if (!data?.success) {
    throw ApiError.internal(data?.message || 'Failed to write to Google Sheets');
  }
  return data.data;
}

export async function appendRow(sheetName, row) {
  return postToSheets({ sheet: sheetName, row });
}

export async function updateRow(sheetName, id, patch) {
  return postToSheets({ sheet: sheetName, action: 'update', id, patch });
}

export async function deleteRow(sheetName, id) {
  return postToSheets({ sheet: sheetName, action: 'delete', id });
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
