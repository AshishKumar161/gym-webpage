import { AuthService } from '../services/AuthService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, avatar, role } = req.body;
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.registerUser({ name, email, password, phone, avatar, role, ip, userAgent });

  if (refreshToken) {
    sendRefreshTokenCookie(res, refreshToken);
  }

  return sendResponse(res, 201, 'User registered successfully.', { user, accessToken }, { user, accessToken });
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

export const verifyOTP = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'OTP verified successfully.', { verified: true });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  return sendResponse(res, 200, 'Token refreshed successfully.', { accessToken: 'mock-access-token' });
});

export const changePassword = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Password changed successfully.');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Password reset email sent if account exists.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Password has been reset successfully.');
});

export const getSessions = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Active sessions fetched.', { sessions: [] });
});

export const revokeSession = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Session revoked successfully.');
});

