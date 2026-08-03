import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID')
});

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10))
});

export const validateRequestParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return next(new ValidationError('Invalid URL parameters', formattedErrors));
  }
  next();
};
