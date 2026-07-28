import axios from 'axios';
import { getToken } from './auth-store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Attaches the admin or student session token depending on which API the
// request is for — the two portals have separate, independent sessions.
api.interceptors.request.use((config) => {
  const role = config.url?.startsWith('/admin') ? 'admin' : config.url?.startsWith('/portal') ? 'student' : null;
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
