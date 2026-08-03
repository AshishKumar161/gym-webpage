/**
 * Auth Session Manager — Enterprise-grade client-side authentication.
 *
 * Security Architecture:
 * - Access tokens are NEVER stored in localStorage or sessionStorage.
 * - Access tokens live in JavaScript memory only (wiped on page unload).
 * - Refresh tokens are stored in HttpOnly Secure SameSite=Strict cookies (managed by server).
 * - On page load, the refresh token cookie is sent automatically to /api/v1/auth/refresh-token.
 * - Access token is refreshed 60s before expiry via proactive timer.
 */

import { API_BASE } from '../config/api.js';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const msg = data.message || (res.status === 409 ? 'Email already registered.' : res.status === 401 ? 'Invalid email or password.' : 'Request failed');
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if the backend API is running.');
    }
    throw err;
  }
}


// In-memory store — never persisted to localStorage
let _accessToken = null;
let _currentUser = null;
let _refreshTimer = null;

// Event bus for auth state changes
const listeners = [];
export const onAuthChange = (fn) => { listeners.push(fn); };
const emit = () => listeners.forEach(fn => fn(_currentUser));

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export const getAccessToken = () => _accessToken;
export const getCurrentUser = () => _currentUser;
export const isAuthenticated = () => !!_accessToken && !!_currentUser;
export const hasRole = (role) => _currentUser?.role === role;
export const isAdmin = () => hasRole('admin');
export const isTrainer = () => hasRole('trainer');
export const isMember = () => hasRole('member');

/**
 * Decode JWT payload without verification (for reading expiry only).
 */
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Schedule a proactive refresh 60 seconds before the access token expires.
 */
function scheduleRefresh(token) {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  const payload = decodeJwt(token);
  if (!payload?.exp) return;
  const msUntilExpiry = payload.exp * 1000 - Date.now() - 60_000;
  if (msUntilExpiry > 0) {
    _refreshTimer = setTimeout(refreshSession, msUntilExpiry);
  }
}

// ─── Core Auth Actions ─────────────────────────────────────────────────────────

/**
 * Register a new user. Returns { success, user } or throws.
 */
export async function registerUser({ name, email, password, phone = '' }) {
  const data = await safeFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, phone })
  });

  _accessToken = data.accessToken;
  _currentUser = data.user;
  scheduleRefresh(_accessToken);
  emit();
  return data;
}

/**
 * Login with email & password. Returns { success, user } or throws.
 */
export async function loginUser({ email, password }) {
  const data = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  _accessToken = data.accessToken;
  _currentUser = data.user;
  scheduleRefresh(_accessToken);
  emit();
  return data;
}


/**
 * Logout current session. Clears memory and removes refresh token cookie via server.
 */
export async function logoutUser() {
  try {
    if (_accessToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${_accessToken}` },
        credentials: 'include'
      });
    }
  } catch { /* silent fail */ } finally {
    _accessToken = null;
    _currentUser = null;
    if (_refreshTimer) clearTimeout(_refreshTimer);
    emit();
  }
}

/**
 * Refresh the access token using the HttpOnly cookie refresh token.
 * Called on app boot and proactively before expiry.
 */
export async function refreshSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) {
      // Refresh token expired or revoked — clear state
      _accessToken = null;
      _currentUser = null;
      emit();
      return false;
    }

    const data = await res.json();
    _accessToken = data.accessToken;

    // Fetch full user profile
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${_accessToken}` },
      credentials: 'include'
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      _currentUser = meData.user;
    }

    scheduleRefresh(_accessToken);
    emit();
    return true;
  } catch {
    _accessToken = null;
    _currentUser = null;
    emit();
    return false;
  }
}

/**
 * Bootstrap auth on application load.
 * Attempts to restore session from refresh token cookie.
 * Returns true if session restored, false if guest.
 */
export async function initAuth() {
  return await refreshSession();
}

/**
 * Forgot password — sends reset email.
 */
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/**
 * Verify OTP for email verification.
 */
export async function verifyOTP(email, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'OTP verification failed');
  return data;
}

/**
 * Returns an Authorization header object for authenticated API calls.
 */
export function authHeader() {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {};
}

/**
 * Check if the current user is allowed to view a given dashboard role.
 * Admin can see all. Others can only see their own dashboard.
 */
export function canAccessDashboard(requestedRole) {
  if (!isAuthenticated()) return false;
  if (isAdmin()) return true;
  return _currentUser.role === requestedRole;
}
