/**
 * Navigation Component — Handles header scroll, mobile menu toggle,
 * keyboard accessibility, active link tracking, and dynamic
 * role-based navigation rendering (Guest / Member / Trainer / Admin).
 */
import { qs, qsa } from '../utils/dom.js';
import { createObserver } from '../utils/observer.js';
import {
  isAuthenticated,
  getCurrentUser,
  logoutUser,
  onAuthChange
} from '../utils/auth.js';
import { openAuthModal } from './auth/AuthModal.js';
import { openDashboard } from './dashboards/DashboardManager.js';

// ─── Nav Configs per Role ───────────────────────────────────────────────────────

const GUEST_AUTH_NAV = `
  <li>
    <button class="btn btn-outline nav-auth-btn" id="nav-btn-login" style="padding:8px 18px;font-size:14px;" aria-label="Login">
      Login
    </button>
  </li>
  <li>
    <button class="btn btn-primary nav-auth-btn" id="nav-btn-register" style="padding:8px 18px;font-size:14px;" aria-label="Register">
      Register
    </button>
  </li>
`;

function buildUserNav(user) {
  const roleEmoji = { admin: '🛡️', trainer: '🏋️', member: '👤' }[user.role] || '👤';
  const roleColor = { admin: '#06b6d4', trainer: '#f59e0b', member: '#10b981' }[user.role] || '#10b981';
  const dashRole = user.role;

  return `
  <li>
    <button
      class="btn nav-portal-btn open-dash-btn"
      data-role="${dashRole}"
      style="padding:8px 16px;font-size:13px;background:rgba(${user.role === 'admin' ? '6,182,212' : user.role === 'trainer' ? '245,158,11' : '16,185,129'},0.15);border:1px solid ${roleColor};color:${roleColor};border-radius:10px;"
      aria-label="Open ${user.role} dashboard"
    >
      ${roleEmoji} My Dashboard
    </button>
  </li>
  <li>
    <div class="nav-user-badge" title="${user.email}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.06);cursor:default;">
      <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,${roleColor},#1e293b);display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;">${user.name.charAt(0).toUpperCase()}</span>
      <span style="font-size:13px;font-weight:600;color:#e2e8f0;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.name.split(' ')[0]}</span>
    </div>
  </li>
  <li>
    <button class="btn btn-ghost nav-auth-btn" id="nav-btn-logout" style="padding:8px 14px;font-size:13px;color:rgba(255,100,100,0.8);border:1px solid rgba(255,100,100,0.2);border-radius:10px;" aria-label="Logout">
      Logout
    </button>
  </li>
  `;
}

// ─── Auth Nav Rendering ─────────────────────────────────────────────────────────

function renderAuthNav() {
  const authSlot = qs('#nav-auth-slot');
  if (!authSlot) return;

  const user = getCurrentUser();
  authSlot.innerHTML = user ? buildUserNav(user) : GUEST_AUTH_NAV;

  // Attach event listeners to newly rendered buttons
  qs('#nav-btn-login')?.addEventListener('click', () => openAuthModal('login'));
  qs('#nav-btn-register')?.addEventListener('click', () => openAuthModal('register'));
  qs('#nav-btn-logout')?.addEventListener('click', handleLogout);

  // Re-attach dashboard button listeners (open-dash-btn injected into nav)
  qsa('#nav-auth-slot .open-dash-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-role') || 'member';
      openDashboard(role);
    });
  });
}

async function handleLogout() {
  const btn = qs('#nav-btn-logout');
  if (btn) { btn.textContent = '...'; btn.disabled = true; }
  await logoutUser();
  // renderAuthNav() is called automatically via onAuthChange listener
}

// ─── Standard Nav Functionality ─────────────────────────────────────────────────

export function initHeaderScroll() {
  const header = qs('#site-header');
  if (!header) return;
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 30);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initMobileNav() {
  const navToggle = qs('#nav-toggle');
  const navMenu = qs('#nav-menu');
  if (!navToggle || !navMenu) return;

  const closeMenu = () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('open');
    navMenu.classList.toggle('open', !isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  qsa('.nav-link', navMenu).forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });
}

export function initActiveNavLinks() {
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = createObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const isMatch = link.getAttribute('href') === `#${targetId}`;
            link.classList.toggle('active', isMatch);
            if (isMatch) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
  );

  if (observer) sections.forEach(section => observer.observe(section));
}

/**
 * initAuthNav — Render auth-aware nav items and subscribe to auth state changes.
 * Must be called after initAuth() resolves.
 */
export function initAuthNav() {
  renderAuthNav();
  // Re-render nav whenever auth state changes (login/logout)
  onAuthChange(() => renderAuthNav());
}
