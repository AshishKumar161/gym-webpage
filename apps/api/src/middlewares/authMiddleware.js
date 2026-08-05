import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { SessionRepository } from '../repositories/SessionRepository.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * protect — Middleware to authenticate requests via JWT Bearer token or HttpOnly Cookie.
 * Attaches the authenticated user object to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await UserRepository.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          errorCode: 'UNAUTHORIZED',
          message: 'User account no longer exists.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      logger.warn(`[AUTH] Access Token invalid/expired: ${error.message}`);
    }
  }

  // Fallback to HttpOnly Refresh Token Cookie if Bearer Token is missing or expired
  const refreshTokenCookie = req.cookies?.refreshToken;
  if (refreshTokenCookie) {
    try {
      const decodedRefresh = verifyRefreshToken(refreshTokenCookie);
      const tokenHash = hashToken(refreshTokenCookie);
      const activeSession = await SessionRepository.findActiveByUserIdAndHash(decodedRefresh.id, tokenHash);

      if (activeSession) {
        const user = await UserRepository.findById(decodedRefresh.id);
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (err) {
      logger.warn(`[AUTH] Refresh Cookie invalid: ${err.message}`);
    }
  }

  return res.status(401).json({
    success: false,
    errorCode: 'UNAUTHORIZED',
    message: 'Authentication required. Please log in.'
  });
};

/**
 * authorize(...roles) — Case-insensitive Backend Role-Based Access Control (RBAC) middleware.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    const userRoleNormalized = (req.user.role || '').toUpperCase();
    const allowedRolesNormalized = roles.map((r) => r.toUpperCase());

    if (!allowedRolesNormalized.includes(userRoleNormalized)) {
      logger.warn(`[RBAC] FORBIDDEN: uid=${req.user.id} role=${req.user.role} attempted ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}.`
      });
    }

    next();
  };
};
