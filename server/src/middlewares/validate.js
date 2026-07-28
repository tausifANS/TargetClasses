import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req.body (or .query / .params) against a Zod schema.
 * Usage: router.post('/x', validate(createStudentSchema), controller)
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors);
  }
  req[source] = result.data;
  next();
};
