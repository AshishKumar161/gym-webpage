import logger from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';

export const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let errors = err.errors || null;

  // Handle Prisma / Database specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate field value entered.';
    errorCode = 'DUPLICATE_KEY_ERROR';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record to update/delete does not exist.';
    errorCode = 'NOT_FOUND';
  }

  const requestId = req.id || req.headers['x-request-id'] || `req-${Date.now()}`;

  logger.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode} - ${message} | RequestId: ${requestId}`);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: errors || [{ message, code: errorCode }],
    meta: {
      timestamp: new Date().toISOString(),
      requestId
    }
  });
};
