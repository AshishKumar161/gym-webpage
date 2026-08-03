import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * protect — Middleware to authenticate requests via JWT Bearer token or HttpOnly Cookie.
 * Attaches the authenticated user object to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If route is /me or optional auth route, allow next() to handle cookie session restore
    if (req.path === '/me' || req.path === '/auth/me') {
      return next();
    }
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+auditLogs');

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // If token expired and endpoint is /me, allow next() for cookie session recovery
    if (req.path === '/me' || req.path === '/auth/me') {
      return next();
    }
    logger.error(`[AUTH] JWT Error: ${error.message}`);
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: 'Session expired. Please refresh your token.'
    });
  }
};

/**
 * authorize(...roles) — Backend Role-Based Access Control (RBAC) middleware.
 * Usage:
 *   router.use('/admin', protect, authorize('admin'));
 *   router.use('/trainer', protect, authorize('trainer', 'admin'));
 *   router.use('/member', protect, authorize('member', 'trainer', 'admin'));
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`[RBAC] FORBIDDEN: uid=${req.user._id} role=${req.user.role} attempted ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}.`
      });
    }

    next();
  };
};
