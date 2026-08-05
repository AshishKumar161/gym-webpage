import { AuthService } from '../services/AuthService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, avatar, role } = req.body;
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.registerUser({
    name,
    email,
    password,
    phone,
    avatar,
    role,
    ip,
    userAgent
  });

  if (refreshToken) {
    sendRefreshTokenCookie(res, refreshToken);
  }

  return sendResponse(res, 201, 'User registered successfully.', { user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.loginUser({ email, password, ip, userAgent });

  sendRefreshTokenCookie(res, refreshToken);

  return sendResponse(res, 200, 'Login successful.', { user, accessToken });
});

export const getMe = asyncHandler(async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  const { user, newAccessToken, newRefreshToken } = await AuthService.getMe(req.user, refreshTokenCookie);

  if (newRefreshToken) {
    sendRefreshTokenCookie(res, newRefreshToken);
  }

  const payload = newAccessToken ? { user, accessToken: newAccessToken } : { user };
  return sendResponse(res, 200, 'Authenticated user profile retrieved.', payload);
});

export const logout = asyncHandler(async (req, res) => {
  const userIdStr = req.user?.id;
  const refreshTokenCookie = req.cookies?.refreshToken;

  await AuthService.logoutUser(userIdStr, refreshTokenCookie);
  clearRefreshTokenCookie(res);

  return sendResponse(res, 200, 'Logged out successfully.');
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userIdStr = req.user?.id;

  await AuthService.logoutAllDevices(userIdStr);
  clearRefreshTokenCookie(res);

  return sendResponse(res, 200, 'Logged out from all devices successfully.');
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyOTP({ email, otp });
  return sendResponse(res, 200, 'Email verified successfully.', result);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const tokenCookie = req.cookies?.refreshToken || req.body?.refreshToken;
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  const { accessToken, refreshToken: newRefreshToken, user } = await AuthService.rotateRefreshToken(tokenCookie, ip, userAgent);

  sendRefreshTokenCookie(res, newRefreshToken);

  return sendResponse(res, 200, 'Token refreshed successfully.', { accessToken, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  await AuthService.changePassword(userId, { currentPassword, newPassword });
  return sendResponse(res, 200, 'Password changed successfully.');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgotPassword({ email });
  return sendResponse(res, 200, 'Password reset link sent if account exists.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await AuthService.resetPassword({ token, newPassword });
  return sendResponse(res, 200, 'Password reset successfully.');
});

export const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const sessions = await AuthService.getSessions(userId);
  return sendResponse(res, 200, 'Active sessions retrieved.', { sessions });
});

export const revokeSession = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.params.id;

  await AuthService.revokeSession(userId, sessionId);
  return sendResponse(res, 200, 'Session revoked successfully.');
});
