import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}
