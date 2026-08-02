import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * authenticate() — Protect routes by verifying JWT Bearer token.
 * Attaches the full user document to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+auditLog');

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
    logger.error(`[AUTH] JWT Error: ${error.message}`);
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: 'Session expired. Please refresh your token.'
    });
  }
};

/**
 * authorize(...roles) — Role-based access control middleware.
 * Must be used AFTER protect().
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler)
 *   router.get('/staff', protect, authorize('admin', 'trainer'), handler)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated.' });
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
