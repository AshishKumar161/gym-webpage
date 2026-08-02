import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie
} from '../utils/jwt.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../config/mailer.js';
import { parseUserAgent } from '../utils/deviceParser.js';
import logger from '../utils/logger.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getClientInfo = (req) => ({
  ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').split(',')[0].trim(),
  ua: req.headers['user-agent'] || ''
});

/**
 * Hash a token for secure storage (we never store plain refresh tokens in Session).
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Create a Session document for a new login.
 * Refresh token hash is stored, not the plain token.
 */
const createSession = async (userId, refreshToken, ip, ua) => {
  const { device, browser, os } = parseUserAgent(ua);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await Session.create({
    userId,
    refreshTokenHash: hashToken(refreshToken),
    device,
    browser,
    os,
    ipAddress: ip,
    userAgent: ua,
    expiresAt
  });

  return session._id.toString();
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * @desc    Register new user & send OTP email
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { ip, ua } = getClientInfo(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({ name, email, password, phone, otpCode: otp, otpExpires });

    // Send OTP (non-blocking)
    sendOTPEmail(email, name, otp).catch((err) =>
      logger.error(`[MAILER] OTP send failed for ${email}: ${err.message}`)
    );

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Create session document
    const sessionId = await createSession(user._id, refreshToken, ip, ua);

    // Store in User.refreshTokens (lightweight index for quick lookup)
    user.refreshTokens.push({ token: refreshToken, ipAddress: ip, userAgent: ua });
    user.auditLog.push({ event: 'REGISTER', ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] REGISTER success: ${email} | IP: ${ip} | Session: ${sessionId}`);

    res.status(201).json({
      success: true,
      message: 'Account created! A 6-digit OTP has been sent to your email.',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

/**
 * @desc    Verify email with OTP
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+otpCode +otpExpires +auditLog');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email is already verified.' });
    if (!user.otpCode || user.otpCode !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    if (user.otpExpires && user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.auditLog.push({ event: 'EMAIL_VERIFIED', ipAddress: ip, userAgent: ua });
    await user.save();

    logger.info(`[AUTH] EMAIL_VERIFIED: ${email} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @desc    Login user — validate credentials, enforce lockout, issue tokens, create session
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +auditLog');
    if (!user) {
      // Prevent user enumeration — same message as wrong password
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ── Account Lockout Check ──
    if (user.isLocked()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      logger.warn(`[AUTH] LOGIN_BLOCKED (locked): ${email} | IP: ${ip}`);
      return res.status(423).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: `Account temporarily locked. Try again in ${remaining} minute(s).`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      user.auditLog.push({ event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua });
      await user.save();
      logger.warn(`[AUTH] LOGIN_FAILED: ${email} | Attempts: ${user.loginAttempts} | IP: ${ip}`);

      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts));
      return res.status(401).json({
        success: false,
        message: `Invalid email or password.${attemptsLeft > 0 ? ` ${attemptsLeft} attempt(s) remaining before lockout.` : ' Account is now locked for 30 minutes.'}`
      });
    }

    // ── Successful Login ──
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIp = ip;

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Create Session document
    const sessionId = await createSession(user._id, refreshToken, ip, ua);

    // Cap concurrent sessions at 10
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: refreshToken, ipAddress: ip, userAgent: ua });
    user.auditLog.push({ event: 'LOGIN', ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] LOGIN success: ${email} | Role: ${user.role} | Session: ${sessionId} | IP: ${ip}`);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
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
  } catch (error) {
    next(error);
  }
};

// ─── Get Me (Session Restore) ────────────────────────────────────────────────

/**
 * @desc    Return current authenticated user profile
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
      phone: user.phone,
      lastLogin: user.lastLogin
    }
  });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * @desc    Issue new access token from HttpOnly refresh token cookie (with rotation)
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, code: 'NO_REFRESH_TOKEN', message: 'Refresh token missing.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('+auditLog');
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Check against Session collection (hash-based lookup)
    const tokenHash = hashToken(token);
    const session = await Session.findOne({ userId: user._id, refreshTokenHash: tokenHash, isRevoked: false });

    if (!session) {
      // Token reuse attack detected — revoke ALL sessions
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
      user.refreshTokens = [];
      user.auditLog.push({ event: 'TOKEN_REUSE_DETECTED', ipAddress: getClientInfo(req).ip });
      await user.save();
      clearRefreshTokenCookie(res);
      logger.error(`[AUTH] REFRESH_TOKEN_REUSE: uid=${user._id} — ALL sessions revoked`);
      return res.status(401).json({ success: false, code: 'TOKEN_REUSE', message: 'Security violation detected. All sessions have been revoked. Please log in again.' });
    }

    // ── Rotate tokens ──
    const { ip, ua } = getClientInfo(req);
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });
    const newTokenHash = hashToken(newRefreshToken);

    // Update session with new token hash
    session.refreshTokenHash = newTokenHash;
    session.lastActivity = new Date();
    await session.save();

    // Update User.refreshTokens inline
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
    user.refreshTokens.push({ token: newRefreshToken, ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * @desc    Logout current session — revoke refresh token & session document
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { ip, ua } = getClientInfo(req);

    if (token && req.user) {
      const tokenHash = hashToken(token);
      // Mark session as revoked
      await Session.findOneAndUpdate(
        { userId: req.user._id, refreshTokenHash: tokenHash },
        { isRevoked: true }
      );
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== token);
      req.user.auditLog.push({ event: 'LOGOUT', ipAddress: ip, userAgent: ua });
      await req.user.save();
    }

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT: uid=${req.user?._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Logout All Devices ───────────────────────────────────────────────────────

/**
 * @desc    Logout from ALL devices — revoke all refresh tokens and sessions
 * @route   POST /api/v1/auth/logout-all
 * @access  Private
 */
export const logoutAll = async (req, res, next) => {
  try {
    const { ip, ua } = getClientInfo(req);

    await Session.updateMany({ userId: req.user._id }, { isRevoked: true });
    req.user.refreshTokens = [];
    req.user.auditLog.push({ event: 'LOGOUT_ALL_DEVICES', ipAddress: ip, userAgent: ua });
    await req.user.save();

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT_ALL: uid=${req.user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Logged out from all devices.' });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────

/**
 * @desc    Change password while logged in (revokes all sessions)
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
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.refreshTokens = [];
    user.auditLog.push({ event: 'PASSWORD_CHANGED', ipAddress: ip, userAgent: ua });
    await user.save();

    await Session.updateMany({ userId: user._id }, { isRevoked: true });

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] PASSWORD_CHANGED: uid=${user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Password updated. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

/**
 * @desc    Send password reset email (prevents email enumeration)
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+auditLog');

    // Always respond 200 to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.auditLog.push({ event: 'PASSWORD_RESET_REQUESTED', ipAddress: ip, userAgent: ua });
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) =>
      logger.error(`[MAILER] Reset email failed for ${email}: ${err.message}`)
    );

    logger.info(`[AUTH] PASSWORD_RESET_REQUESTED: ${email} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * @desc    Reset password using time-limited token from email link
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
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    user.auditLog.push({ event: 'PASSWORD_RESET', ipAddress: ip, userAgent: ua });
    await user.save();

    await Session.updateMany({ userId: user._id }, { isRevoked: true });

    logger.info(`[AUTH] PASSWORD_RESET: uid=${user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get all active sessions for current user
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).select('-refreshTokenHash -userAgent').sort({ lastActivity: -1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke a specific session by ID
 * @route   DELETE /api/v1/auth/sessions/:id
 * @access  Private
 */
export const revokeSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.isRevoked = true;
    await session.save();

    // Also remove from User.refreshTokens (best-effort)
    // We don't have the plain token in Session, but isRevoked=true blocks refresh
    logger.info(`[AUTH] SESSION_REVOKED: sessionId=${session._id} | uid=${req.user._id}`);
    res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    next(error);
  }
};
