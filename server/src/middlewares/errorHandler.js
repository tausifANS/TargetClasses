import { logger } from '../utils/logger.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next({ statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  if (statusCode >= 500) {
    logger.error(err.message, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    ...(err.details ? { details: err.details } : {}),
    ...(!isProd && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
