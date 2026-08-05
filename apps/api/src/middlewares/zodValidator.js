import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

/**
 * Validates the request body against a Zod schema.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: 'VALIDATION_ERROR'
    }));
    return next(new ValidationError(formattedErrors[0]?.message || 'Validation failed', formattedErrors));
  }
  req.body = result.data; // Overwrite with sanitized data
  next();
};

/**
 * Validates the request query against a Zod schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: 'VALIDATION_ERROR'
    }));
    return next(new ValidationError('Invalid query parameters', formattedErrors));
  }
  req.query = result.data;
  next();
};

/**
 * Validates the request params against a Zod schema.
 */
export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: 'VALIDATION_ERROR'
    }));
    return next(new ValidationError('Invalid URL parameters', formattedErrors));
  }
  req.params = result.data;
  next();
};
