/**
 * Standard API Response Formatter
 * Standard Format:
 * {
 *   success: true | false,
 *   message: string,
 *   data: object | array | null,
 *   timestamp: ISO string,
 *   requestId: string
 * }
 */
export const sendResponse = (res, statusCode, message, data = null, meta = {}) => {
  const requestId = res.req?.id || res.req?.headers?.['x-request-id'] || `req-${Date.now()}`;
  
  const responsePayload = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    errors: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      ...meta
    }
  };

  return res.status(statusCode).json(responsePayload);
};
