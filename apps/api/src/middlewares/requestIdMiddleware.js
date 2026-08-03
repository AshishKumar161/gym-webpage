import crypto from 'crypto';

/**
 * Middleware to generate or forward x-request-id for distributed tracing.
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
