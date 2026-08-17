import axios from 'axios';
import { getToken } from './auth-store';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
// In dev the client/server share an origin via the Vite proxy, so this is ''
// and resolveMediaUrl() below is a no-op. In production the client and server
// are deployed as separate Vercel projects with different domains, so
// server-hosted images (/uploads/...) need this prefix or they'll 404 against
// the client's own domain.
const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

/** Resolves a server-relative media path (e.g. an /uploads/... PhotoUrl/ImageUrl from Sheets) to an absolute URL. Leaves already-absolute URLs and client-bundled static paths (/images/, /brand/) untouched. */
export function resolveMediaUrl(url?: string | null) {
  if (!url) return url ?? undefined;
  if (/^https?:\/\//.test(url) || !url.startsWith('/uploads/')) return url;
  return `${SERVER_ORIGIN}${url}`;
}

// Attaches the admin or student session token depending on which API the
// request is for — the two portals have separate, independent sessions.
api.interceptors.request.use((config) => {
  let role: 'admin' | 'student' | 'user' | null = null;
  if (config.url?.startsWith('/admin')) role = 'admin';
  else if (config.url?.startsWith('/portal')) role = 'student';
  else if (config.url?.startsWith('/comments') || config.url?.startsWith('/user-auth/me')) role = 'user';
  if (role) {
    const token = getToken(role);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}
