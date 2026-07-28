import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date string/number as dd-mm-yyyy — used throughout the admin portal. Returns the raw value if it isn't a valid date. */
export function formatDateDMY(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

/** True if a field name looks like it holds a date (DOB, EventDate, SubmittedAt, ScheduledAt, plain Date). */
export function looksLikeDateField(key: string): boolean {
  return key === 'DOB' || key === 'Date' || /Date$|At$/.test(key);
}

/** Case-insensitive search across every field of a row — used by the admin portal's search boxes. */
export function matchesSearch<T extends object>(row: T, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return Object.values(row as Record<string, unknown>).some(
    (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
  );
}
