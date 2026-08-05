import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_12345_dev_only';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_67890_dev_only';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generates an Access Token for a given user payload.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: ACCESS_EXPIRES });
};

/**
 * Generates a Refresh Token for a given user payload with optional token ID (jti).
 */
export const generateRefreshToken = (payload, refreshTokenId = crypto.randomUUID()) => {
  return jwt.sign({ ...payload, jti: refreshTokenId }, getRefreshSecret(), { expiresIn: REFRESH_EXPIRES });
};

/**
 * Verifies an Access Token.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

/**
 * Verifies a Refresh Token.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

/**
 * Sets Refresh Token in an HttpOnly, Secure, SameSite Cookie.
 */
export const sendRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clears Refresh Token HttpOnly cookie.
 */
export const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth'
  });
};
