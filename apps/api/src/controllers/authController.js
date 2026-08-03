import { AuthService } from '../services/AuthService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, avatar, role } = req.body;

  const result = await AuthService.registerUser({ name, email, password, phone, avatar, role });

  return sendResponse(res, 201, 'User registered successfully.', { user: result.user }, { user: result.user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.loginUser({ email, password, ip, userAgent });

  sendRefreshTokenCookie(res, refreshToken);

  return sendResponse(res, 200, 'Login successful.', { user, accessToken }, { user, accessToken });
});

export const getMe = asyncHandler(async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  const { user, newAccessToken, newRefreshToken } = await AuthService.getMe(req.user, refreshTokenCookie);

  if (newRefreshToken) {
    sendRefreshTokenCookie(res, newRefreshToken);
  }

  const extraPayload = newAccessToken ? { accessToken: newAccessToken, user } : { user };
  return sendResponse(res, 200, 'Authenticated user retrieved successfully.', { user }, extraPayload);
});

export const logout = asyncHandler(async (req, res) => {
  const userIdStr = req.user?.id || req.user?._id?.toString();
  const refreshTokenCookie = req.cookies?.refreshToken;

  await AuthService.logoutUser(userIdStr, refreshTokenCookie);
  clearRefreshTokenCookie(res);

  return sendResponse(res, 200, 'Logged out successfully.');
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userIdStr = req.user?.id || req.user?._id?.toString();

  await AuthService.logoutAllDevices(userIdStr);
  clearRefreshTokenCookie(res);

  return sendResponse(res, 200, 'Logged out from all devices successfully.');
});
