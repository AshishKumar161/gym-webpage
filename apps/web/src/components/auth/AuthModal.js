/**
 * AuthModal — Enterprise Glassmorphic Login / Register / Forgot Password modal.
 *
 * Tabs: login | register | forgot
 *
 * Usage:
 *   import { initAuthModal, openAuthModal } from './auth/AuthModal.js';
 *   initAuthModal();
 *   openAuthModal('login');
 */
import { loginUser, registerUser, forgotPassword } from '../../utils/auth.js';
import { qs } from '../../utils/dom.js';

let onSuccessCallback = null;

// ─── HTML Template ─────────────────────────────────────────────────────────────

function getModalHTML() {
  return `
<div id="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" style="display:none;">
  <div class="auth-modal-backdrop"></div>
  <div class="auth-modal-card">
    <!-- Close Button -->
    <button class="auth-modal-close" id="auth-modal-close" aria-label="Close">✕</button>

    <!-- Brand Header -->
    <div class="auth-modal-brand">
      <span class="auth-logo">A²</span>
      <span class="auth-brand-name">ReVamp Gym</span>
    </div>

    <!-- Tab Navigation -->
    <div class="auth-tabs" role="tablist">
      <button class="auth-tab active" data-tab="login" role="tab" aria-selected="true">Login</button>
      <button class="auth-tab" data-tab="register" role="tab" aria-selected="false">Register</button>
    </div>

    <!-- Status Message -->
    <div id="auth-status" class="auth-status" aria-live="polite"></div>

    <!-- ── Login Form ── -->
    <form id="auth-form-login" class="auth-form" novalidate>
      <h2 id="auth-modal-title" class="auth-form-title">Welcome Back</h2>
      <p class="auth-form-sub">Sign in to your gym portal</p>

      <div class="auth-field">
        <label for="login-email">Email Address</label>
        <input type="email" id="login-email" name="email" placeholder="you@example.com" autocomplete="email" required />
      </div>
      <div class="auth-field">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" name="password" placeholder="••••••••" autocomplete="current-password" required />
      </div>

      <button type="button" class="auth-forgot-link" id="auth-goto-forgot">Forgot Password?</button>

      <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-login">
        <span class="btn-text">Sign In</span>
        <span class="btn-spinner" aria-hidden="true" style="display:none;">⏳</span>
      </button>
    </form>

    <!-- ── Register Form ── -->
    <form id="auth-form-register" class="auth-form" style="display:none;" novalidate>
      <h2 class="auth-form-title">Create Account</h2>
      <p class="auth-form-sub">Join A² ReVamp Gym today</p>

      <div class="auth-field">
        <label for="reg-name">Full Name</label>
        <input type="text" id="reg-name" name="name" placeholder="Rahul Sharma" autocomplete="name" required />
      </div>
      <div class="auth-field">
        <label for="reg-email">Email Address</label>
        <input type="email" id="reg-email" name="email" placeholder="you@example.com" autocomplete="email" required />
      </div>
      <div class="auth-field">
        <label for="reg-phone">Phone (Optional)</label>
        <input type="tel" id="reg-phone" name="phone" placeholder="+91 98765 43210" autocomplete="tel" />
      </div>
      <div class="auth-field">
        <label for="reg-password">Password</label>
        <input type="password" id="reg-password" name="password" placeholder="Min 8 chars, 1 uppercase, 1 number" autocomplete="new-password" required />
        <div class="password-strength" id="password-strength"></div>
      </div>

      <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-register">
        <span class="btn-text">Create Account</span>
        <span class="btn-spinner" aria-hidden="true" style="display:none;">⏳</span>
      </button>
    </form>

    <!-- ── Forgot Password Form ── -->
    <form id="auth-form-forgot" class="auth-form" style="display:none;" novalidate>
      <h2 class="auth-form-title">Reset Password</h2>
      <p class="auth-form-sub">We'll send a reset link to your email</p>

      <div class="auth-field">
        <label for="forgot-email">Email Address</label>
        <input type="email" id="forgot-email" name="email" placeholder="you@example.com" autocomplete="email" required />
      </div>

      <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-forgot">
        <span class="btn-text">Send Reset Link</span>
        <span class="btn-spinner" aria-hidden="true" style="display:none;">⏳</span>
      </button>

      <button type="button" class="auth-forgot-link" id="auth-back-to-login">← Back to Login</button>
    </form>

    <!-- ── Reset Password Form (From Email Link) ── -->
    <form id="auth-form-reset" class="auth-form" style="display:none;" novalidate>
      <h2 class="auth-form-title">Set New Password</h2>
      <p class="auth-form-sub">Enter your new password below</p>
      
      <input type="hidden" id="reset-token" name="token" />

      <div class="auth-field">
        <label for="reset-password">New Password</label>
        <input type="password" id="reset-password" name="password" placeholder="Min 8 chars, 1 uppercase, 1 number" required />
      </div>
      <div class="auth-field">
        <label for="reset-confirm">Confirm Password</label>
        <input type="password" id="reset-confirm" name="confirm" placeholder="Re-enter password" required />
      </div>

      <button type="submit" class="btn btn-primary auth-submit-btn" id="btn-reset">
        <span class="btn-text">Update Password</span>
        <span class="btn-spinner" aria-hidden="true" style="display:none;">⏳</span>
      </button>
    </form>

  </div>
</div>`;
}

// ─── CSS Injection ─────────────────────────────────────────────────────────────

function injectStyles() {
  if (qs('#auth-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'auth-modal-styles';
  style.textContent = `
#auth-modal {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  animation: authFadeIn 0.2s ease;
}
@keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }

.auth-modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
}
.auth-modal-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  margin: 1rem;
  background: rgba(15,20,30,0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,179,237,0.1);
  animation: authSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes authSlideUp { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:none; } }

.auth-modal-close {
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(255,255,255,0.08); border: none;
  color: #fff; width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; font-size: 14px; transition: background 0.2s;
}
.auth-modal-close:hover { background: rgba(255,255,255,0.18); }

.auth-modal-brand {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 1.5rem;
}
.auth-logo {
  background: linear-gradient(135deg,#3b82f6,#06b6d4);
  color: #fff; font-weight: 900; font-size: 18px;
  width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center;
}
.auth-brand-name { font-weight: 700; font-size: 1.1rem; color: #e2e8f0; }

.auth-tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; }
.auth-tab {
  flex: 1; padding: 8px; border: none; background: transparent;
  color: rgba(255,255,255,0.5); cursor: pointer; border-radius: 8px;
  font-size: 14px; font-weight: 600; transition: all 0.2s;
}
.auth-tab.active { background: rgba(59,130,246,0.2); color: #93c5fd; }

.auth-status {
  padding: 10px 14px; border-radius: 10px; font-size: 13px;
  margin-bottom: 1rem; display: none;
}
.auth-status.success { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); display: block; }
.auth-status.error { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); display: block; }

.auth-form-title { font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin: 0 0 4px; }
.auth-form-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 1.5rem; }

.auth-field { margin-bottom: 1rem; }
.auth-field label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
.auth-field input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #f8fafc; font-size: 14px; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.auth-field input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }

.auth-submit-btn { width: 100%; margin-top: 1rem; padding: 12px; font-size: 15px; border-radius: 12px; }
.auth-forgot-link {
  background: none; border: none; color: rgba(99,179,237,0.8);
  font-size: 12px; cursor: pointer; padding: 4px 0; margin-top: 4px; text-decoration: underline;
}
.auth-forgot-link:hover { color: #93c5fd; }

.password-strength { height: 4px; border-radius: 4px; margin-top: 6px; background: rgba(255,255,255,0.1); transition: all 0.3s; }
.password-strength.weak { background: linear-gradient(90deg,#ef4444 33%,transparent 33%); }
.password-strength.medium { background: linear-gradient(90deg,#f59e0b 66%,transparent 66%); }
.password-strength.strong { background: #10b981; }
  `;
  document.head.appendChild(style);
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function showStatus(message, type = 'error') {
  const el = qs('#auth-status');
  if (!el) return;
  el.textContent = message;
  el.className = `auth-status ${type}`;
}

function clearStatus() {
  const el = qs('#auth-status');
  if (el) { el.textContent = ''; el.className = 'auth-status'; }
}

function setLoading(btnId, loading) {
  const btn = qs(`#${btnId}`);
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (text) text.style.opacity = loading ? '0.4' : '1';
  if (spinner) spinner.style.display = loading ? 'inline' : 'none';
}

function checkPasswordStrength(password) {
  const bar = qs('#password-strength');
  if (!bar) return;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) bar.className = 'password-strength weak';
  else if (score <= 2) bar.className = 'password-strength medium';
  else bar.className = 'password-strength strong';
}

// ─── Tab / Form Switching ──────────────────────────────────────────────────────

function showForm(tab) {
  ['login', 'register', 'forgot', 'reset'].forEach(t => {
    const form = qs(`#auth-form-${t}`);
    if (form) form.style.display = t === tab ? 'block' : 'none';
  });
  
  // Hide tabs entirely if we're on the reset screen
  const authTabs = qs('.auth-tabs');
  if (authTabs) {
    authTabs.style.display = tab === 'reset' ? 'none' : 'flex';
  }
  
  clearStatus();
}

function activateTab(tab) {
  qs('.auth-tabs')?.querySelectorAll('.auth-tab').forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  showForm(tab);
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function openAuthModal(tab = 'login', onSuccess = null) {
  const modal = qs('#auth-modal');
  if (!modal) return;
  onSuccessCallback = onSuccess;
  activateTab(tab);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Focus first input
  setTimeout(() => qs('#auth-modal-card input, #auth-modal input')?.focus(), 100);
}

export function closeAuthModal() {
  const modal = qs('#auth-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  clearStatus();
}

// ─── Initialiser ──────────────────────────────────────────────────────────────

export function initAuthModal() {
  injectStyles();

  // Inject modal HTML if not already present
  if (!qs('#auth-modal')) {
    document.body.insertAdjacentHTML('beforeend', getModalHTML());
  }

  // Handle URL Params for Email Verification and Password Reset
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action === 'verify') {
    const success = urlParams.get('success') === 'true';
    openAuthModal('login');
    if (success) {
      showStatus('Email verified successfully! You may now log in.', 'success');
    } else {
      showStatus('Email verification failed. The link may have expired or is invalid.', 'error');
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (action === 'reset') {
    const token = urlParams.get('token');
    if (token) {
      openAuthModal('login'); // To open the modal wrapper
      showForm('reset'); // To force show the reset form specifically
      const tokenInput = qs('#reset-token');
      if (tokenInput) tokenInput.value = token;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Tab switching
  qs('.auth-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.auth-tab')?.dataset.tab;
    if (tab) activateTab(tab);
  });

  // Close button
  qs('#auth-modal-close')?.addEventListener('click', closeAuthModal);

  // Click backdrop to close
  qs('.auth-modal-backdrop')?.addEventListener('click', closeAuthModal);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qs('#auth-modal')?.style.display !== 'none') {
      closeAuthModal();
    }
  });

  // Forgot / back links
  qs('#auth-goto-forgot')?.addEventListener('click', () => { activateTab('forgot'); showForm('forgot'); });
  qs('#auth-back-to-login')?.addEventListener('click', () => activateTab('login'));

  // Password strength meter
  qs('#reg-password')?.addEventListener('input', (e) => checkPasswordStrength(e.target.value));

  // ── Login Submit ──
  qs('#auth-form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();
    const email = qs('#login-email').value.trim();
    const password = qs('#login-password').value;
    if (!email || !password) return showStatus('Please fill in all fields.');
    setLoading('btn-login', true);
    try {
      await loginUser({ email, password });
      showStatus('Login successful! Loading your dashboard...', 'success');
      setTimeout(() => {
        closeAuthModal();
        if (onSuccessCallback) onSuccessCallback();
      }, 800);
    } catch (err) {
      showStatus(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading('btn-login', false);
    }
  });

  // ── Register Submit ──
  qs('#auth-form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();
    const name = qs('#reg-name').value.trim();
    const email = qs('#reg-email').value.trim();
    const phone = qs('#reg-phone').value.trim();
    const password = qs('#reg-password').value;
    if (!name || !email || !password) return showStatus('Please fill in all required fields.');
    setLoading('btn-register', true);
    try {
      await registerUser({ name, email, password, phone });
      showStatus('Account created! A verification OTP has been sent to your email.', 'success');
      setTimeout(() => {
        closeAuthModal();
        if (onSuccessCallback) onSuccessCallback();
      }, 1000);
    } catch (err) {
      showStatus(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading('btn-register', false);
    }
  });

  // ── Forgot Password Submit ──
  qs('#auth-form-forgot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();
    const email = qs('#forgot-email').value.trim();
    if (!email) return showStatus('Please enter your email address.');
    setLoading('btn-forgot', true);
    try {
      await forgotPassword(email);
      showStatus('Reset link sent! Check your inbox (and spam folder).', 'success');
    } catch (err) {
      showStatus(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading('btn-forgot', false);
    }
  });

  // ── Reset Password Submit ──
  qs('#auth-form-reset')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();
    const token = qs('#reset-token').value;
    const password = qs('#reset-password').value;
    const confirm = qs('#reset-confirm').value;
    
    if (!password || !confirm) return showStatus('Please enter your new password.');
    if (password !== confirm) return showStatus('Passwords do not match.');
    
    setLoading('btn-reset', true);
    try {
      // Need to import resetPassword from utils/auth.js above
      const { resetPassword } = await import('../../utils/auth.js');
      await resetPassword(token, password);
      showStatus('Password updated successfully! Please login with your new password.', 'success');
      setTimeout(() => activateTab('login'), 2000);
    } catch (err) {
      showStatus(err.message || 'Failed to update password. The link might be expired.');
    } finally {
      setLoading('btn-reset', false);
    }
  });
}
