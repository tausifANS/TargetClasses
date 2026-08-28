import * as sheetsService from './sheets.service.js';

// Short-lived cache so every email send / settings read doesn't hit Sheets —
// settings change rarely (an admin rotating a password), so a minute of
// staleness is a fine trade for far fewer requests to Apps Script.
const CACHE_TTL_MS = 60_000;
let cache = null;
let cacheAt = 0;

async function loadAll() {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  const rows = await sheetsService.listRows('Settings');
  cache = new Map(rows.map((r) => [r.Key, { id: r.Id, value: r.Value }]));
  cacheAt = Date.now();
  return cache;
}

function invalidateCache() {
  cache = null;
}

/** Returns a setting's value, or `fallback` (e.g. the env var default) if not set in Sheets. */
export async function getSetting(key, fallback = '') {
  const all = await loadAll();
  const entry = all.get(key);
  return entry?.value || fallback;
}

export async function getSettings(keys) {
  const all = await loadAll();
  const result = {};
  for (const key of keys) result[key] = all.get(key)?.value || '';
  return result;
}

/** Creates or updates a setting row by Key. */
export async function setSetting(key, value) {
  const all = await loadAll();
  const existing = all.get(key);

  if (existing) {
    await sheetsService.updateRow('Settings', existing.id, { Value: value });
  } else {
    await sheetsService.appendRow('Settings', { Key: key, Value: value });
  }
  invalidateCache();
}
