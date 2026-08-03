import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import prisma from '../config/prisma.js';
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
    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } catch {
      user = await User.findById(decoded.id).select('+auditLogs');
    }

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
 * authorize(...roles) — Case-insensitive Backend Role-Based Access Control (RBAC) middleware.
 * Usage:
 *   router.use('/admin', protect, authorize('ADMIN'));
 *   router.use('/trainer', protect, authorize('TRAINER', 'ADMIN'));
 *   router.use('/member', protect, authorize('MEMBER', 'TRAINER', 'ADMIN'));
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

    const userRoleNormalized = (req.user.role || '').toUpperCase();
    const allowedRolesNormalized = roles.map((r) => r.toUpperCase());

    if (!allowedRolesNormalized.includes(userRoleNormalized)) {
      logger.warn(`[RBAC] FORBIDDEN: uid=${req.user.id || req.user._id} role=${req.user.role} attempted ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}.`
      });
    }

    next();
  };
};
