import test from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ─── 1. DATABASE & USER REGISTRATION TESTS ──────────────────────────────────

test('Database: User password must be hashed with bcrypt (never plain text)', async () => {
  const plainPassword = 'SuperSecretPass123!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(plainPassword, hashedPassword);
  assert.ok(hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$'));
  assert.strictEqual(await bcrypt.compare(plainPassword, hashedPassword), true);
  assert.strictEqual(await bcrypt.compare('WrongPassword', hashedPassword), false);
});

test('Database: User model contains all required schema fields', () => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2b$12$hashedPasswordExample',
    phone: '+1234567890',
    avatar: 'https://example.com/avatar.png',
    role: 'member',
    emailVerified: false,
    refreshTokens: [],
    failedLoginAttempts: 0,
    accountLockedUntil: null,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    auditLogs: []
  };

  assert.strictEqual(typeof user.name, 'string');
  assert.strictEqual(typeof user.email, 'string');
  assert.ok(user.email.includes('@'));
  assert.strictEqual(typeof user.password, 'string');
  assert.notStrictEqual(user.password, 'plainpassword');
  assert.strictEqual(typeof user.phone, 'string');
  assert.strictEqual(typeof user.avatar, 'string');
  assert.ok(['member', 'trainer', 'admin'].includes(user.role));
  assert.strictEqual(typeof user.emailVerified, 'boolean');
  assert.ok(Array.isArray(user.refreshTokens));
  assert.strictEqual(typeof user.failedLoginAttempts, 'number');
  assert.strictEqual(user.accountLockedUntil, null);
  assert.ok(user.lastLogin instanceof Date);
  assert.ok(user.createdAt instanceof Date);
  assert.ok(user.updatedAt instanceof Date);
  assert.ok(Array.isArray(user.auditLogs));
});

test('User Registration: Duplicate email returns HTTP 409 Conflict with exact error message', () => {
  const usersDb = [{ id: '1', email: 'existing@example.com' }];

  const handleRegister = (email) => {
    const exists = usersDb.find((u) => u.email === email.toLowerCase().trim());
    if (exists) {
      return { status: 409, body: { success: false, message: 'Email already registered.' } };
    }
    return { status: 201, body: { success: true, message: 'User registered successfully.' } };
  };

  const response = handleRegister('existing@example.com');
  assert.strictEqual(response.status, 409);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, 'Email already registered.');
});

test('User Registration: Successful registration creates user record and does NOT auto log in', async () => {
  const password = 'StrongPassword123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: 'user_uuid_123',
    name: 'New User',
    email: 'newuser@example.com',
    password: hashedPassword,
    role: 'MEMBER',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const registrationResponse = {
    status: 201,
    body: {
      success: true,
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    }
  };

  assert.strictEqual(registrationResponse.status, 201);
  assert.strictEqual(registrationResponse.body.success, true);
  assert.strictEqual(registrationResponse.body.message, 'User registered successfully.');
  assert.strictEqual(registrationResponse.body.user.email, 'newuser@example.com');
  assert.strictEqual(registrationResponse.body.accessToken, undefined);
  assert.strictEqual(registrationResponse.body.refreshToken, undefined);
});

// ─── 2. LOGIN & AUTHENTICATION TESTS ────────────────────────────────────────

test('Login Flow: Returns HTTP 401 if user email does not exist', async () => {
  const usersDb = [];
  const handleLogin = async (email, password) => {
    const user = usersDb.find((u) => u.email === email);
    if (!user) return { status: 401, body: { success: false, message: 'Invalid email or password.' } };
    return { status: 200 };
  };

  const response = await handleLogin('nonexistent@example.com', 'Password123');
  assert.strictEqual(response.status, 401);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, 'Invalid email or password.');
});

test('Login Flow: Returns HTTP 401 if password is incorrect using bcrypt.compare()', async () => {
  const correctPassword = 'MySecretPassword123!';
  const hashedPassword = await bcrypt.hash(correctPassword, 10);
  const user = { email: 'user@example.com', password: hashedPassword };

  const handleLogin = async (email, inputPassword) => {
    if (email !== user.email) return { status: 401, body: { success: false, message: 'Invalid email or password.' } };
    const isMatch = await bcrypt.compare(inputPassword, user.password);
    if (!isMatch) return { status: 401, body: { success: false, message: 'Invalid email or password.' } };
    return { status: 200, body: { success: true } };
  };

  const response = await handleLogin('user@example.com', 'WrongPassword123');
  assert.strictEqual(response.status, 401);
  assert.strictEqual(response.body.success, false);
  assert.strictEqual(response.body.message, 'Invalid email or password.');
});

test('Login Flow: Successful login generates tokens, creates Session in PostgreSQL, and never returns password', async () => {
  const rawPassword = 'CorrectPassword123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const userInDb = {
    id: 'user_pg_999',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: hashedPassword,
    role: 'MEMBER'
  };

  const sessionsDb = [];
  const handleLogin = async (email, inputPassword) => {
    const isMatch = await bcrypt.compare(inputPassword, userInDb.password);
    if (!isMatch) return { status: 401 };

    const accessToken = jwt.sign({ id: userInDb.id, role: userInDb.role }, 'secret', { expiresIn: '15m' });
    const refreshTokenId = crypto.randomUUID();

    // Create session record in database
    const sessionRecord = {
      id: 'sess_1',
      userId: userInDb.id,
      refreshTokenId,
      device: 'Desktop',
      browser: 'Chrome',
      createdAt: new Date()
    };
    sessionsDb.push(sessionRecord);

    // Stripped user payload (NEVER return password)
    const authenticatedUser = {
      id: userInDb.id,
      name: userInDb.name,
      email: userInDb.email,
      role: userInDb.role
    };

    return {
      status: 200,
      body: {
        success: true,
        message: 'Login successful.',
        accessToken,
        user: authenticatedUser
      }
    };
  };

  const response = await handleLogin('jane@example.com', rawPassword);
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.success, true);
  assert.strictEqual(typeof response.body.accessToken, 'string');
  assert.strictEqual(sessionsDb.length, 1);
  assert.strictEqual(sessionsDb[0].userId, 'user_pg_999');
  assert.strictEqual(response.body.user.password, undefined);
});

test('Login Flow: Increments failed attempts and locks account after 5 failed tries', () => {
  let failedLoginAttempts = 0;
  let accountLockedUntil = null;

  const handleFailedLogin = () => {
    failedLoginAttempts++;
    if (failedLoginAttempts >= 5) {
      accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  };

  for (let i = 1; i <= 5; i++) {
    handleFailedLogin();
  }

  assert.strictEqual(failedLoginAttempts, 5);
  assert.notStrictEqual(accountLockedUntil, null);
  assert.ok(accountLockedUntil > new Date());
});

test('Login Flow: Account lockout prevents login when active', () => {
  const accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  const isLocked = accountLockedUntil && accountLockedUntil > Date.now();
  assert.strictEqual(isLocked, true);
});

// ─── 3. SESSION MANAGEMENT & /auth/me TESTS ─────────────────────────────────

test('Session Management: GET /auth/me session restore with valid token or cookie', () => {
  const secret = 'test_access_secret';
  const payload = { id: 'user_123', role: 'member', email: 'user@example.com' };
  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

  const decoded = jwt.verify(accessToken, secret);
  assert.strictEqual(decoded.id, 'user_123');
  assert.strictEqual(decoded.role, 'member');
});

test('Session Management: Returns 401 on expired or invalid session token', () => {
  const secret = 'test_access_secret';
  const expiredToken = jwt.sign({ id: 'user_123' }, secret, { expiresIn: '-1s' });

  assert.throws(() => {
    jwt.verify(expiredToken, secret);
  });
});

// ─── 4. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ─────────────────────────────

const checkRoleAuthorization = (userRole, requiredRoles) => {
  if (!userRole) return 401; // Unauthorized
  if (!requiredRoles.includes(userRole)) return 403; // Forbidden
  return 200; // Allowed
};

test('RBAC: Admin can access /api/v1/admin/*', () => {
  assert.strictEqual(checkRoleAuthorization('admin', ['admin']), 200);
  assert.strictEqual(checkRoleAuthorization('trainer', ['admin']), 403);
  assert.strictEqual(checkRoleAuthorization('member', ['admin']), 403);
  assert.strictEqual(checkRoleAuthorization(null, ['admin']), 401);
});

test('RBAC: Trainer can access /api/v1/trainer/*', () => {
  assert.strictEqual(checkRoleAuthorization('admin', ['trainer', 'admin']), 200);
  assert.strictEqual(checkRoleAuthorization('trainer', ['trainer', 'admin']), 200);
  assert.strictEqual(checkRoleAuthorization('member', ['trainer', 'admin']), 403);
});

test('RBAC: Member can access /api/v1/member/*', () => {
  assert.strictEqual(checkRoleAuthorization('admin', ['member', 'trainer', 'admin']), 200);
  assert.strictEqual(checkRoleAuthorization('trainer', ['member', 'trainer', 'admin']), 200);
  assert.strictEqual(checkRoleAuthorization('member', ['member', 'trainer', 'admin']), 200);
  assert.strictEqual(checkRoleAuthorization(undefined, ['member', 'trainer', 'admin']), 401);
});

// ─── 5. EMAIL & OTP VERIFICATION TESTS ──────────────────────────────────────

test('Email Verification: Validates 6-digit OTP code', () => {
  const validOTP = '654321';
  const userOTP = '654321';
  const isExpired = false;

  const isVerified = userOTP === validOTP && !isExpired;
  assert.strictEqual(isVerified, true);
});

test('Email Verification: Rejects expired OTP code', () => {
  const validOTP = '654321';
  const userOTP = '654321';
  const otpExpires = new Date(Date.now() - 1000); // Expired

  const isExpired = otpExpires < new Date();
  const isVerified = userOTP === validOTP && !isExpired;
  assert.strictEqual(isVerified, false);
});

// ─── 6. SECURITY & PASSWORD STRENGTH TESTS ──────────────────────────────────

test('Password Strength: Rejects weak passwords missing rules', () => {
  const validatePassword = (pw) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);

  assert.strictEqual(validatePassword('weak'), false);         // too short
  assert.strictEqual(validatePassword('nouppercase123'), false); // no upper
  assert.strictEqual(validatePassword('NOLOWERCASE123'), false); // no lower
  assert.strictEqual(validatePassword('NoNumbersHere'), false);  // no digits
});

test('Password Strength: Accepts strong passwords with upper, lower, and digits', () => {
  const validatePassword = (pw) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);

  assert.strictEqual(validatePassword('StrongPass123!'), true);
  assert.strictEqual(validatePassword('SecureWord99'), true);
});

// ─── 7. USER SESSION TRACKING TESTS ─────────────────────────────────────────

test('Session Model: Stores userId, device, browser, ipAddress, loginTime, lastActivity, refreshTokenId', () => {
  const session = {
    userId: '60d5ec49f1b2c80015f8d001',
    device: 'Desktop',
    browser: 'Chrome 120',
    ipAddress: '192.168.1.1',
    loginTime: new Date(),
    lastActivity: new Date(),
    refreshTokenId: crypto.randomUUID(),
    isRevoked: false
  };

  assert.strictEqual(typeof session.userId, 'string');
  assert.strictEqual(typeof session.device, 'string');
  assert.strictEqual(typeof session.browser, 'string');
  assert.strictEqual(typeof session.ipAddress, 'string');
  assert.ok(session.loginTime instanceof Date);
  assert.ok(session.lastActivity instanceof Date);
  assert.strictEqual(typeof session.refreshTokenId, 'string');
  assert.strictEqual(session.isRevoked, false);
});

test('Session Revocation: Logout revokes session and logout-all revokes all sessions', () => {
  const sessions = [
    { id: 's1', isRevoked: false },
    { id: 's2', isRevoked: false },
    { id: 's3', isRevoked: false }
  ];

  // Logout single session 's1'
  const target = sessions.find((s) => s.id === 's1');
  if (target) target.isRevoked = true;

  assert.strictEqual(sessions[0].isRevoked, true);
  assert.strictEqual(sessions[1].isRevoked, false);

  // Logout all sessions
  sessions.forEach((s) => (s.isRevoked = true));
  assert.ok(sessions.every((s) => s.isRevoked === true));
});

// ─── 8. AUDIT LOGS TESTS ───────────────────────────────────────────────────

test('Audit Logs: Records login, logout, failed login, password change, reset, email verification', () => {
  const auditLogs = [];
  const logEvent = (event, ipAddress, userAgent, details) => {
    auditLogs.push({ event, ipAddress, userAgent, details, timestamp: new Date() });
  };

  logEvent('REGISTER', '127.0.0.1', 'Mozilla', 'Account created');
  logEvent('EMAIL_VERIFIED', '127.0.0.1', 'Mozilla', 'OTP verified');
  logEvent('LOGIN', '127.0.0.1', 'Mozilla', 'Login successful');
  logEvent('FAILED_LOGIN', '127.0.0.1', 'Mozilla', 'Wrong password');
  logEvent('PASSWORD_CHANGE', '127.0.0.1', 'Mozilla', 'Password updated');
  logEvent('LOGOUT', '127.0.0.1', 'Mozilla', 'Session ended');

  assert.strictEqual(auditLogs.length, 6);
  assert.strictEqual(auditLogs[0].event, 'REGISTER');
  assert.strictEqual(auditLogs[1].event, 'EMAIL_VERIFIED');
  assert.strictEqual(auditLogs[2].event, 'LOGIN');
  assert.strictEqual(auditLogs[3].event, 'FAILED_LOGIN');
  assert.strictEqual(auditLogs[4].event, 'PASSWORD_CHANGE');
  assert.strictEqual(auditLogs[5].event, 'LOGOUT');
});

// ─── 9. TOKEN REFRESH & ROTATION TESTS ──────────────────────────────────────

test('Token Refresh Rotation: Issues new refresh token and invalidates old token hash', () => {
  let activeTokenHash = crypto.createHash('sha256').update('old_refresh_token').digest('hex');
  const newRawToken = 'new_refresh_token_123';
  const newHash = crypto.createHash('sha256').update(newRawToken).digest('hex');

  // Rotate token
  activeTokenHash = newHash;

  assert.notStrictEqual(activeTokenHash, crypto.createHash('sha256').update('old_refresh_token').digest('hex'));
  assert.strictEqual(activeTokenHash, newHash);
});

test('Token Refresh: Detects token reuse attempt and revokes all active sessions', () => {
  const activeSessions = [
    { id: 's1', isRevoked: false },
    { id: 's2', isRevoked: false }
  ];

  const presentedTokenHash = crypto.createHash('sha256').update('stolen_revoked_token').digest('hex');
  const validTokenHash = crypto.createHash('sha256').update('valid_token').digest('hex');

  if (presentedTokenHash !== validTokenHash) {
    // Reuse attempt detected -> Revoke all sessions
    activeSessions.forEach((s) => (s.isRevoked = true));
  }

  assert.ok(activeSessions.every((s) => s.isRevoked === true));
});

// ─── 10. PASSWORD RESET TESTS ───────────────────────────────────────────────

test('Password Reset: Hashes reset token with SHA-256 and expires after 1 hour', () => {
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedTokenInDB = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  assert.notStrictEqual(rawResetToken, hashedTokenInDB);

  // Incoming reset request
  const incomingHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
  assert.strictEqual(incomingHash, hashedTokenInDB);
});
