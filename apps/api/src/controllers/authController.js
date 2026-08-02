import crypto from 'crypto';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie
} from '../utils/jwt.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../config/mailer.js';
import logger from '../utils/logger.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getClientInfo = (req) => ({
  ip: req.ip || req.headers['x-forwarded-for'] || '',
  ua: req.headers['user-agent'] || ''
});

/**
 * @desc    Register a new User & send OTP
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { ip, ua } = getClientInfo(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({ name, email, password, phone, otpCode: otp, otpExpires });
    await user.save();

    await sendOTPEmail(email, name, otp).catch(() => {});

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshTokens.push({ token: refreshToken, ipAddress: ip, userAgent: ua });
    user.auditLog.push({ event: 'REGISTER', ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] REGISTER: ${email} | IP: ${ip}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to your email.',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP for Email Verification
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+otpCode +otpExpires +auditLog');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'User is already verified' });
    if (!user.otpCode || user.otpCode !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    if (user.otpExpires && user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired' });

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.auditLog.push({ event: 'EMAIL_VERIFIED', ipAddress: ip, userAgent: ua });
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login User & return JWT Access Token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +auditLog');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked due to too many failed attempts. Try again in ${unlockTime} minute(s).`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      user.auditLog.push({ event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua });
      await user.save();
      logger.warn(`[AUTH] LOGIN_FAILED: ${email} | IP: ${ip}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Successful login — reset attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    user.lastLoginIp = ip;

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Limit to max 10 concurrent sessions
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: refreshToken, ipAddress: ip, userAgent: ua });
    user.auditLog.push({ event: 'LOGIN', ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] LOGIN: ${email} | Role: ${user.role} | IP: ${ip}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, avatar: user.avatar }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user (session restore)
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    }
  });
};

/**
 * @desc    Refresh Access Token using httpOnly Refresh Token cookie
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+auditLog');
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokenEntry = user.refreshTokens.find(t => t.token === token);
    if (!tokenEntry) {
      // Possible token reuse attack — revoke ALL tokens
      user.refreshTokens = [];
      await user.save();
      clearRefreshTokenCookie(res);
      logger.warn(`[AUTH] REFRESH_TOKEN_REUSE DETECTED: uid=${user._id}`);
      return res.status(401).json({ success: false, message: 'Token reuse detected. All sessions revoked.' });
    }

    // Rotate tokens
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });
    const { ip, ua } = getClientInfo(req);

    user.refreshTokens.push({ token: newRefreshToken, ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * @desc    Logout User & Revoke current Refresh Token
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { ip, ua } = getClientInfo(req);
    if (token && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== token);
      req.user.auditLog.push({ event: 'LOGOUT', ipAddress: ip, userAgent: ua });
      await req.user.save();
    }
    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT: uid=${req.user?._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout from ALL devices (revoke all refresh tokens)
 * @route   POST /api/v1/auth/logout-all
 * @access  Private
 */
export const logoutAll = async (req, res, next) => {
  try {
    const { ip, ua } = getClientInfo(req);
    req.user.refreshTokens = [];
    req.user.auditLog.push({ event: 'LOGOUT_ALL_DEVICES', ipAddress: ip, userAgent: ua });
    await req.user.save();
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change Password (while logged in)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findById(req.user._id).select('+password +auditLog');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.refreshTokens = []; // Revoke all sessions on password change
    user.auditLog.push({ event: 'PASSWORD_CHANGED', ipAddress: ip, userAgent: ua });
    await user.save();

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] PASSWORD_CHANGED: uid=${user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password — Send Reset Token Email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { ip, ua } = getClientInfo(req);
    const user = await User.findOne({ email }).select('+auditLog');

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    user.auditLog.push({ event: 'PASSWORD_RESET_REQUESTED', ipAddress: ip, userAgent: ua });
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl).catch(() => {});

    logger.info(`[AUTH] PASSWORD_RESET_REQUESTED: ${email} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const { ip, ua } = getClientInfo(req);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+auditLog');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshTokens = [];
    user.auditLog.push({ event: 'PASSWORD_RESET', ipAddress: ip, userAgent: ua });
    await user.save();

    logger.info(`[AUTH] PASSWORD_RESET: uid=${user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active sessions for the current user
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
export const getSessions = async (req, res) => {
  const user = await User.findById(req.user._id);
  const sessions = user.refreshTokens.map(t => ({
    id: t._id,
    ipAddress: t.ipAddress,
    userAgent: t.userAgent,
    createdAt: t.createdAt
  }));
  res.status(200).json({ success: true, sessions });
};

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/v1/auth/sessions/:id
 * @access  Private
 */
export const revokeSession = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshTokens = user.refreshTokens.filter(t => t._id.toString() !== req.params.id);
  await user.save();
  res.status(200).json({ success: true, message: 'Session revoked' });
};
