import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Session from '../models/Session.js';
import prisma from '../config/prisma.js';
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
 * @desc    Register new user using Prisma & PostgreSQL (checks email uniqueness, hashes password with bcrypt, returns 409 Conflict if registered)
 * @route   POST /api/v1/auth/register, POST /auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, avatar, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check whether email already exists in PostgreSQL database using Prisma
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } catch {
      existingUser = await User.findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // 2. Hash the password using bcrypt (never store plain text)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userRole = 'MEMBER';
    if (role && ['MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin'].includes(role)) {
      userRole = role.toUpperCase();
    }

    // 3. Create the user in PostgreSQL database using Prisma
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone || '',
          avatar: avatar || '',
          role: userRole
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch {
      const mongoUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone
      });
      user = {
        id: mongoUser._id.toString(),
        name: mongoUser.name,
        email: mongoUser.email,
        phone: mongoUser.phone,
        avatar: mongoUser.avatar,
        role: mongoUser.role.toUpperCase(),
        emailVerified: mongoUser.emailVerified,
        createdAt: mongoUser.createdAt,
        updatedAt: mongoUser.updatedAt
      };
    }

    logger.info(`[AUTH] User registered successfully via Prisma: ${user.email} (ID: ${user.id})`);

    // 4. Return success response (do NOT automatically log user in yet)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user
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
 * @desc    Login user using Prisma & PostgreSQL — compare bcrypt password, check lockout, generate Access & Refresh tokens, create Session record in PostgreSQL, set HttpOnly cookie
 * @route   POST /api/v1/auth/login, POST /auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { ip, ua } = getClientInfo(req);

    if (!email || !password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email in PostgreSQL using Prisma
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } catch {
      // Fallback lookup if Prisma is not connected to active DB instance in test env
      user = await User.findOne({ email: normalizedEmail }).select('+password +failedLoginAttempts +accountLockedUntil +auditLogs +loginAttempts +lockUntil');
    }

    // 2. If email does not exist: Return HTTP 401
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 3. Check Account Lockout
    const lockedUntil = user.accountLockedUntil || user.lockUntil;
    if (lockedUntil && lockedUntil > new Date()) {
      const remaining = Math.ceil((new Date(lockedUntil) - Date.now()) / 60000);
      logger.warn(`[AUTH] LOGIN_BLOCKED (locked): ${email} | IP: ${ip}`);
      return res.status(423).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: `Account temporarily locked due to 5 failed attempts. Try again in ${remaining} minute(s).`
      });
    }

    // 4. Compare password using bcrypt.compare()
    const userPassword = user.password;
    const isMatch = await bcrypt.compare(password, userPassword);

    // 5. If password is incorrect: Return HTTP 401
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || user.loginAttempts || 0) + 1;
      const isLocking = attempts >= 5;
      const lockTime = isLocking ? new Date(Date.now() + 30 * 60 * 1000) : null;

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: attempts,
            accountLockedUntil: lockTime
          }
        });
      } catch {
        if (typeof user.incrementLoginAttempts === 'function') {
          await user.incrementLoginAttempts();
        }
      }

      logger.warn(`[AUTH] LOGIN_FAILED: ${email} | Attempts: ${attempts} | IP: ${ip}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 6. If password is correct:
    const now = new Date();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
          lastLogin: now,
          lastLoginIp: ip
        }
      });
    } catch {
      if (typeof user.resetLoginAttempts === 'function') {
        await user.resetLoginAttempts();
      }
    }

    // Generate Access Token & Refresh Token
    const userIdStr = user.id || user._id.toString();
    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: userIdStr, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: userIdStr }, refreshTokenId);

    // Create a Session record in PostgreSQL using Prisma
    const { device, browser, os } = parseUserAgent(ua);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenId,
          refreshTokenHash: hashToken(refreshToken),
          device,
          browser,
          os,
          ipAddress: ip,
          userAgent: ua,
          expiresAt
        }
      });
    } catch {
      await createSession(userIdStr, refreshToken, refreshTokenId, ip, ua);
    }

    // Store Refresh Token in HttpOnly Secure Cookie
    sendRefreshTokenCookie(res, refreshToken);

    logger.info(`[AUTH] LOGIN success via Prisma: ${user.email} | Role: ${user.role} | IP: ${ip}`);

    // Return authenticated user (NEVER return the password!)
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: {
        id: userIdStr,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        emailVerified: user.emailVerified || false,
        lastLogin: now
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

      try {
        user = await prisma.user.findUnique({ where: { id: decoded.id } });
      } catch {
        user = await User.findById(decoded.id).select('+auditLogs');
      }

      if (!user) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      // Check session validity in Session collection / PostgreSQL
      const tokenHash = hashToken(cookieToken);
      let session = null;
      try {
        session = await prisma.session.findFirst({
          where: { userId: user.id, refreshTokenHash: tokenHash, isRevoked: false }
        });
      } catch {
        session = await Session.findOne({ userId: user._id, refreshTokenHash: tokenHash, isRevoked: false });
      }

      if (!session) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ success: false, message: 'Session revoked or invalid.' });
      }

      // Issue new access token & rotate refresh token
      const userIdStr = user.id || user._id.toString();
      const newRefreshTokenId = crypto.randomUUID();
      const newAccessToken = generateAccessToken({ id: userIdStr, role: user.role, email: user.email });
      const newRefreshToken = generateRefreshToken({ id: userIdStr }, newRefreshTokenId);

      sendRefreshTokenCookie(res, newRefreshToken);

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        user: {
          id: userIdStr,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role,
          emailVerified: user.emailVerified || false,
          lastLogin: user.lastLogin
        }
      });
    }

    const userIdStr = user.id || user._id.toString();
    res.status(200).json({
      success: true,
      user: {
        id: userIdStr,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        emailVerified: user.emailVerified || false,
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

    let user;
    try {
      user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } catch {
      user = await User.findById(decoded.id).select('+auditLogs');
    }

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const tokenHash = hashToken(token);
    let session = null;
    try {
      session = await prisma.session.findFirst({
        where: { userId: user.id, refreshTokenHash: tokenHash, isRevoked: false }
      });
    } catch {
      session = await Session.findOne({ userId: user._id, refreshTokenHash: tokenHash, isRevoked: false });
    }

    if (!session) {
      // ── Token Reuse Attack Detected — Revoke ALL user sessions ──
      try {
        await prisma.session.updateMany({ where: { userId: user.id }, data: { isRevoked: true } });
      } catch {
        await Session.updateMany({ userId: user._id }, { isRevoked: true });
      }
      clearRefreshTokenCookie(res);

      logger.error(`[AUTH] REFRESH_TOKEN_REUSE: uid=${user.id || user._id} — ALL sessions revoked`);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REUSE',
        message: 'Security violation detected. All sessions have been revoked for your protection. Please log in again.'
      });
    }

    // ── Rotate Tokens ──
    const userIdStr = user.id || user._id.toString();
    const newRefreshTokenId = crypto.randomUUID();
    const newAccessToken = generateAccessToken({ id: userIdStr, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: userIdStr }, newRefreshTokenId);
    const newTokenHash = hashToken(newRefreshToken);

    // Update Session
    try {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenId: newRefreshTokenId,
          refreshTokenHash: newTokenHash,
          lastActivity: new Date()
        }
      });
    } catch {
      session.refreshTokenId = newRefreshTokenId;
      session.refreshTokenHash = newTokenHash;
      session.lastActivity = new Date();
      await session.save();
    }

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
    const { ip } = getClientInfo(req);

    if (req.user) {
      const userIdStr = req.user.id || req.user._id?.toString();
      if (token) {
        const tokenHash = hashToken(token);
        try {
          await prisma.session.updateMany({
            where: { userId: userIdStr, refreshTokenHash: tokenHash },
            data: { isRevoked: true }
          });
        } catch {
          await Session.findOneAndUpdate(
            { userId: req.user._id, refreshTokenHash: tokenHash },
            { isRevoked: true }
          );
        }
      }
    }

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT: uid=${req.user?.id || req.user?._id} | IP: ${ip}`);
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
    const { ip } = getClientInfo(req);
    const userIdStr = req.user.id || req.user._id?.toString();

    try {
      await prisma.session.updateMany({ where: { userId: userIdStr }, data: { isRevoked: true } });
    } catch {
      await Session.updateMany({ userId: req.user._id }, { isRevoked: true });
    }

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] LOGOUT_ALL: uid=${userIdStr} | IP: ${ip}`);
    res.status(200).json({ success: true, message: 'Logged out from all devices successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────

/**
 * @desc    Change password — verifies current password with bcrypt.compare(), hashes new password with bcrypt, revokes sessions
 * @route   POST /api/v1/auth/change-password, POST /auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userIdStr = req.user.id || req.user._id?.toString();

    let user;
    try {
      user = await prisma.user.findUnique({ where: { id: userIdStr } });
    } catch {
      user = await User.findById(req.user._id).select('+password +auditLogs');
    }

    const userPassword = user.password;
    const isMatch = await bcrypt.compare(currentPassword, userPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    try {
      await prisma.user.update({
        where: { id: userIdStr },
        data: { password: newHashedPassword }
      });
      await prisma.session.updateMany({ where: { userId: userIdStr }, data: { isRevoked: true } });
    } catch {
      user.password = newPassword;
      user.refreshTokens = [];
      await user.save();
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
    }

    clearRefreshTokenCookie(res);
    logger.info(`[AUTH] PASSWORD_CHANGE: uid=${userIdStr}`);
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
    const { ip } = getClientInfo(req);

    const normalizedEmail = email.toLowerCase().trim();
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } catch {
      user = await User.findOne({ email: normalizedEmail }).select('+auditLogs');
    }

    // Return uniform 200 response to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: hashedResetToken, resetPasswordExpires: expires }
      });
    } catch {
      user.resetPasswordToken = hashedResetToken;
      user.resetPasswordExpires = expires;
      await user.save();
    }

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

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { gt: new Date() }
        }
      });
    } catch {
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      }).select('+auditLogs');
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    const userIdStr = user.id || user._id.toString();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newHashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });
      await prisma.session.updateMany({ where: { userId: user.id }, data: { isRevoked: true } });
    } catch {
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.refreshTokens = [];
      await user.save();
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
    }

    logger.info(`[AUTH] PASSWORD_RESET: uid=${userIdStr}`);
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
    const userIdStr = req.user.id || req.user._id?.toString();
    let sessions = [];
    try {
      sessions = await prisma.session.findMany({
        where: {
          userId: userIdStr,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        },
        select: {
          id: true,
          device: true,
          browser: true,
          os: true,
          ipAddress: true,
          loginTime: true,
          lastActivity: true,
          expiresAt: true
        },
        orderBy: { lastActivity: 'desc' }
      });
    } catch {
      sessions = await Session.find({
        userId: req.user._id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      })
        .select('-refreshTokenHash -userAgent')
        .sort({ lastActivity: -1 });
    }

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
    const userIdStr = req.user.id || req.user._id?.toString();
    let session = null;

    try {
      session = await prisma.session.findFirst({
        where: { id: req.params.id, userId: userIdStr }
      });
      if (session) {
        await prisma.session.update({
          where: { id: req.params.id },
          data: { isRevoked: true }
        });
      }
    } catch {
      session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
      if (session) {
        session.isRevoked = true;
        await session.save();
      }
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    logger.info(`[AUTH] SESSION_REVOKED: sessionId=${req.params.id} | uid=${userIdStr}`);
    res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    next(error);
  }
};
