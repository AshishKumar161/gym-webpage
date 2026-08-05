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

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const serverMsg = (data.errors && data.errors[0]?.message) || data.message;
      const fallbackMsg = res.status === 409 ? 'Email already registered.' : res.status === 401 ? 'Invalid email or password.' : 'Request failed';
      const msg = serverMsg || fallbackMsg;
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
export const hasRole = (role) => (_currentUser?.role || '').toLowerCase() === role.toLowerCase();
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
 * Register a new user. Returns user object or throws error.
 */
export async function registerUser({ name, email, password, phone = '' }) {
  const data = await safeFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, phone })
  });

  const payload = data.data || data;
  _accessToken = payload.accessToken;
  _currentUser = payload.user;
  scheduleRefresh(_accessToken);
  emit();
  return payload;
}

/**
 * Login with email & password. Returns user object or throws error.
 */
export async function loginUser({ email, password }) {
  const data = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const payload = data.data || data;
  _accessToken = payload.accessToken;
  _currentUser = payload.user;
  scheduleRefresh(_accessToken);
  emit();
  return payload;
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
      _accessToken = null;
      _currentUser = null;
      emit();
      return false;
    }

    const data = await res.json();
    const payload = data.data || data;
    _accessToken = payload.accessToken;

    if (payload.user) {
      _currentUser = payload.user;
    } else {
      // Fetch user profile if not in refresh response
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${_accessToken}` },
        credentials: 'include'
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        _currentUser = meData.data?.user || meData.user;
      }
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
 */
export async function initAuth() {
  return await refreshSession();
}

/**
 * Forgot password — sends reset email.
 */
export async function forgotPassword(email) {
  const data = await safeFetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return data;
}

/**
 * Reset password using token.
 */
export async function resetPassword(token, newPassword) {
  const data = await safeFetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return data;
}

/**
 * Change current user password.
 */
export async function changePassword(currentPassword, newPassword) {
  const data = await safeFetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return data;
}

/**
 * Verify OTP for email verification.
 */
export async function verifyOTP(email, otp) {
  const data = await safeFetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return data;
}

/**
 * Returns an Authorization header object for authenticated API calls.
 */
export function authHeader() {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {};
}

/**
 * Authenticated safe fetch wrapper with offline detection and auto-retries.
 */
export async function safeFetchApi(endpoint, options = {}, retries = 1) {
  if (!navigator.onLine) {
    throw new Error('OFFLINE_ERROR');
  }
  
  const url = `${API_BASE}${endpoint}`;
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(options.headers || {})
    },
    credentials: 'include'
  };

  try {
    const res = await fetch(url, fetchOptions);
    if (res.status === 401 && retries > 0) {
      // Attempt token refresh and retry once
      const refreshed = await refreshSession();
      if (refreshed) {
        return safeFetchApi(endpoint, options, 0);
      }
    }
    
    let data;
    try { data = await res.json(); } catch { data = null; }
    
    if (!res.ok) {
      throw new Error(data?.message || 'API_ERROR');
    }
    return data?.data || data;
  } catch (err) {
    if (err.message === 'OFFLINE_ERROR') throw err;
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error('NETWORK_ERROR');
    }
    throw err;
  }
}

/**
 * Common Loading Skeleton HTML
 */
export const getLoadingSkeleton = () => `
  <div style="display:flex; flex-direction:column; gap:1.5rem; animation: pulse 1.5s infinite ease-in-out;">
    <div style="height:40px; width:40%; background:var(--bg-surface-2); border-radius:8px;"></div>
    <div class="dash-metrics-grid">
      <div style="height:100px; background:var(--bg-surface-2); border-radius:12px;"></div>
      <div style="height:100px; background:var(--bg-surface-2); border-radius:12px;"></div>
      <div style="height:100px; background:var(--bg-surface-2); border-radius:12px;"></div>
    </div>
    <div style="height:300px; background:var(--bg-surface-2); border-radius:12px;"></div>
  </div>
`;

/**
 * Common Error State HTML
 */
export const getErrorStateHTML = (errorType, retryFnName) => `
  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:3rem;">
    <div style="font-size:3rem; margin-bottom:1rem;">${errorType === 'OFFLINE_ERROR' ? '📡' : '⚠️'}</div>
    <h3 style="font-size:1.5rem; margin-bottom:0.5rem; color:var(--text);">${errorType === 'OFFLINE_ERROR' ? 'You are offline' : 'Failed to load data'}</h3>
    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
      ${errorType === 'OFFLINE_ERROR' ? 'Please check your internet connection and try again.' : 'An error occurred while communicating with the server.'}
    </p>
    <button class="btn btn-primary" onclick="${retryFnName}()">Try Again</button>
  </div>
`;

/**
 * Check if the current user is allowed to view a given dashboard role.
 * Admin can see all. Others can only see their own dashboard.
 */
export function canAccessDashboard(requestedRole) {
  if (!isAuthenticated()) return false;
  if (isAdmin()) return true;
  return (_currentUser?.role || '').toLowerCase() === requestedRole.toLowerCase();
}
