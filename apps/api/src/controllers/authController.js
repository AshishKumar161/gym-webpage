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
 * Hash a token using SHA-256 for secure storage in Session collection.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Create a Session document in MongoDB for a new login/registration.
 */
const createSession = async (userId, refreshToken, refreshTokenId, ip, ua) => {
  const { device, browser, os } = parseUserAgent(ua);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await Session.create({
    userId,
    refreshTokenId,
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
 * @desc    Register new user, hash password, send OTP email, set secure cookie
 * @route   POST /api/v1/auth/register, POST /auth/register
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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      otpCode: otp,
      otpExpires
    });

    // Send OTP email (non-blocking)
    sendOTPEmail(email, name, otp).catch((err) =>
      logger.error(`[MAILER] OTP send failed for ${email}: ${err.message}`)
    );

    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id }, refreshTokenId);

    // Create session document
    const sessionId = await createSession(user._id, refreshToken, refreshTokenId, ip, ua);

    user.refreshTokens.push({ token: refreshToken, refreshTokenId, ipAddress: ip, userAgent: ua });
    user.auditLogs.push({ event: 'REGISTER', ipAddress: ip, userAgent: ua, details: 'User registered' });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] REGISTER success: ${email} | IP: ${ip} | Session: ${sessionId}`);

    res.status(201).json({
      success: true,
      message: 'Account created! A 6-digit OTP has been sent to your email.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify OTP / Email ────────────────────────────────────────────────────────

/**
 * @desc    Verify email with OTP code
 * @route   POST /api/v1/auth/verify-otp, POST /auth/verify-email
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+otpCode +otpExpires +auditLogs');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email is already verified.' });
    if (!user.otpCode || user.otpCode !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    if (user.otpExpires && user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    user.emailVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.auditLogs.push({ event: 'EMAIL_VERIFIED', ipAddress: ip, userAgent: ua, details: 'Email address verified via OTP' });
    await user.save();

    logger.info(`[AUTH] EMAIL_VERIFIED: ${email} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @desc    Login user — bcrypt match, lockout after 5 attempts, store session, set cookie
 * @route   POST /api/v1/auth/login, POST /auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select(
      '+password +failedLoginAttempts +accountLockedUntil +auditLogs +loginAttempts +lockUntil'
    );
    if (!user) {
      // Uniform response to prevent user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ── Check Account Lockout ──
    if (user.isLocked()) {
      const remaining = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
      logger.warn(`[AUTH] LOGIN_BLOCKED (locked): ${email} | IP: ${ip}`);
      return res.status(423).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: `Account temporarily locked due to 5 failed attempts. Try again in ${remaining} minute(s).`
      });
    }

    // ── Compare Password with bcrypt.compare() ──
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      user.auditLogs.push({ event: 'FAILED_LOGIN', ipAddress: ip, userAgent: ua, details: 'Incorrect password attempt' });
      await user.save();

      logger.warn(`[AUTH] LOGIN_FAILED: ${email} | Failed Attempts: ${user.failedLoginAttempts} | IP: ${ip}`);

      const attemptsLeft = Math.max(0, 5 - (user.failedLoginAttempts || 0));
      return res.status(401).json({
        success: false,
        message: `Invalid email or password.${attemptsLeft > 0 ? ` ${attemptsLeft} attempt(s) remaining before account lockout.` : ' Account has been locked for 30 minutes.'}`
      });
    }

    // ── Successful Login ──
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    user.lastLoginIp = ip;

    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id }, refreshTokenId);

    // Create Session document
    const sessionId = await createSession(user._id, refreshToken, refreshTokenId, ip, ua);

    // Cap active sessions stored in User document at 10
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: refreshToken, refreshTokenId, ipAddress: ip, userAgent: ua });
    user.auditLogs.push({ event: 'LOGIN', ipAddress: ip, userAgent: ua, details: `Login successful from ${ip}` });
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
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        isVerified: user.emailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Me (Session Restore / User Profile) ──────────────────────────────────

/**
 * @desc    Validate session & return current user details
 * @route   GET /api/v1/auth/me, GET /auth/me
 * @access  Private (or session restore via refresh cookie)
 */
export const getMe = async (req, res, next) => {
  try {
    let user = req.user;

    // If req.user is not set (e.g. access token expired or missing), check refresh cookie
    if (!user) {
      const cookieToken = req.cookies?.refreshToken;
      if (!cookieToken) {
        return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated.' });
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(cookieToken);
      } catch {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ success: false, code: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' });
      }

      user = await User.findById(decoded.id).select('+auditLogs');
      if (!user) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      // Check session validity in Session collection
      const tokenHash = hashToken(cookieToken);
      const session = await Session.findOne({ userId: user._id, refreshTokenHash: tokenHash, isRevoked: false });

      if (!session) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ success: false, message: 'Session revoked or invalid.' });
      }

      // Issue new access token & rotate refresh token
      const newRefreshTokenId = crypto.randomUUID();
      const newAccessToken = generateAccessToken({ id: user._id, role: user.role, email: user.email });
      const newRefreshToken = generateRefreshToken({ id: user._id }, newRefreshTokenId);

      session.refreshTokenId = newRefreshTokenId;
      session.refreshTokenHash = hashToken(newRefreshToken);
      session.lastActivity = new Date();
      await session.save();

      sendRefreshTokenCookie(res, newRefreshToken);

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          emailVerified: user.emailVerified,
          isVerified: user.emailVerified,
          lastLogin: user.lastLogin
        }
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        isVerified: user.emailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token (Rotation & Re-issue) ─────────────────────────────────────

/**
 * @desc    Issue new access token & rotate refresh token
 * @route   POST /api/v1/auth/refresh, POST /api/v1/auth/refresh-token, POST /auth/refresh
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
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

    const user = await User.findById(decoded.id).select('+auditLogs');
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const tokenHash = hashToken(token);
    const session = await Session.findOne({ userId: user._id, refreshTokenHash: tokenHash, isRevoked: false });

    if (!session) {
      // ── Token Reuse Attack Detected — Revoke ALL user sessions ──
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
      user.refreshTokens = [];
      user.auditLogs.push({
        event: 'TOKEN_REUSE_DETECTED',
        ipAddress: getClientInfo(req).ip,
        userAgent: getClientInfo(req).ua,
        details: 'Attempted reuse of revoked or unknown refresh token'
      });
      await user.save();
      clearRefreshTokenCookie(res);

      logger.error(`[AUTH] REFRESH_TOKEN_REUSE: uid=${user._id} — ALL sessions revoked`);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REUSE',
        message: 'Security violation detected. All sessions have been revoked for your protection. Please log in again.'
      });
    }

    // ── Rotate Tokens ──
    const { ip, ua } = getClientInfo(req);
    const newRefreshTokenId = crypto.randomUUID();
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user._id }, newRefreshTokenId);
    const newTokenHash = hashToken(newRefreshToken);

    // Update Session document
    session.refreshTokenId = newRefreshTokenId;
    session.refreshTokenHash = newTokenHash;
    session.lastActivity = new Date();
    await session.save();

    // Update User refreshTokens inline
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    user.refreshTokens.push({ token: newRefreshToken, refreshTokenId: newRefreshTokenId, ipAddress: ip, userAgent: ua });
    await user.save();

    sendRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * @desc    Logout current session — revoke session document & clear cookie
 * @route   POST /api/v1/auth/logout, POST /auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { ip, ua } = getClientInfo(req);

    if (req.user) {
      if (token) {
        const tokenHash = hashToken(token);
        await Session.findOneAndUpdate(
          { userId: req.user._id, refreshTokenHash: tokenHash },
          { isRevoked: true }
        );
        req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== token);
      } else {
        // Revoke most recently updated session if token not passed
        const latestSession = await Session.findOne({ userId: req.user._id, isRevoked: false }).sort({ lastActivity: -1 });
        if (latestSession) {
          latestSession.isRevoked = true;
          await latestSession.save();
        }
      }

      req.user.auditLogs.push({ event: 'LOGOUT', ipAddress: ip, userAgent: ua, details: 'User logged out' });
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
 * @desc    Logout from all devices — revoke all sessions & clear cookie
 * @route   POST /api/v1/auth/logout-all, POST /auth/logout-all
 * @access  Private
 */
export const logoutAll = async (req, res, next) => {
  try {
    const { ip, ua } = getClientInfo(req);

    await Session.updateMany({ userId: req.user._id }, { isRevoked: true });
    req.user.refreshTokens = [];
    req.user.auditLogs.push({ event: 'LOGOUT_ALL_DEVICES', ipAddress: ip, userAgent: ua, details: 'Logged out from all active sessions' });
    await req.user.save();

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT_ALL: uid=${req.user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Logged out from all devices successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────

/**
 * @desc    Change password — verifies current password, hashes new password with bcrypt, revokes sessions
 * @route   POST /api/v1/auth/change-password, POST /auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findById(req.user._id).select('+password +auditLogs');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // Pre-save hook will hash with bcrypt
    user.refreshTokens = [];
    user.auditLogs.push({ event: 'PASSWORD_CHANGE', ipAddress: ip, userAgent: ua, details: 'User changed password' });
    await user.save();

    await Session.updateMany({ userId: user._id }, { isRevoked: true });

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] PASSWORD_CHANGE: uid=${user._id} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Password updated successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

/**
 * @desc    Send password reset link via email (prevents email enumeration)
 * @route   POST /api/v1/auth/forgot-password, POST /auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { ip, ua } = getClientInfo(req);

    const user = await User.findOne({ email }).select('+auditLogs');

    // Return uniform 200 response to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.auditLogs.push({ event: 'PASSWORD_RESET_REQUESTED', ipAddress: ip, userAgent: ua, details: 'Password reset link requested' });
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) =>
      logger.error(`[MAILER] Reset email failed for ${email}: ${err.message}`)
    );

    logger.info(`[AUTH] PASSWORD_RESET_REQUESTED: ${email} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * @desc    Reset password using reset token from email
 * @route   POST /api/v1/auth/reset-password, POST /auth/reset-password
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
    }).select('+auditLogs');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    user.password = newPassword; // Pre-save hook will hash with bcrypt
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    user.auditLogs.push({ event: 'PASSWORD_RESET', ipAddress: ip, userAgent: ua, details: 'Password reset via email token' });
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
 * @desc    Get all active sessions for logged-in user
 * @route   GET /api/v1/auth/sessions, GET /auth/sessions
 * @access  Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    })
      .select('-refreshTokenHash -userAgent')
      .sort({ lastActivity: -1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke a specific session by session ID
 * @route   DELETE /api/v1/auth/sessions/:id, DELETE /auth/sessions/:id
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

    logger.info(`[AUTH] SESSION_REVOKED: sessionId=${session._id} | uid=${req.user._id}`);
    res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    next(error);
  }
};
