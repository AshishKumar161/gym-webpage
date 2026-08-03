/**
 * Async handler wrapper to catch unhandled rejections in controllers/middlewares
 * and pass them directly to the global error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
