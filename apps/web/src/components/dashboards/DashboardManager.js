/**
 * Unified Dashboard Manager — RBAC-Guarded Dashboard Controller.
 *
 * Security Model:
 * - Unauthenticated users → Auth Modal (Login/Register).
 * - Wrong role → 403 Access Denied view (rendered inside dashboard).
 * - Admin → can access all 3 dashboard views.
 * - Trainer → trainer + member views only.
 * - Member → member view only.
 */
import { qs, qsa, lockScroll, unlockScroll } from '../../utils/dom.js';
import { exportToPDF, exportToExcel } from '../../utils/export.js';
import { triggerRazorpayCheckout, triggerStripeCheckout } from '../PaymentGateways.js';
import { renderSidebar } from './Sidebar.js';
import { renderAdminView } from './AdminDashboard.js';
import { renderTrainerView } from './TrainerDashboard.js';
import { renderMemberView } from './MemberDashboard.js';
import { renderQRScannerView } from './QRScanner.js';
import { renderCalendarView } from './CalendarView.js';
import {
  isAuthenticated,
  getCurrentUser,
  canAccessDashboard,
  logoutUser,
  onAuthChange
} from '../../utils/auth.js';
import { openAuthModal } from '../auth/AuthModal.js';

let currentRole = 'member';
let currentTab = 'overview';

// ─── 403 Access Denied Renderer ────────────────────────────────────────────────

function render403View(requestedRole) {
  const user = getCurrentUser();
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:4rem 2rem;text-align:center;">
      <div style="font-size:80px;line-height:1;margin-bottom:1rem;">🚫</div>
      <h2 style="font-size:2rem;font-weight:800;color:#ef4444;margin-bottom:0.5rem;">403 — Access Denied</h2>
      <p style="color:rgba(255,255,255,0.5);max-width:400px;margin-bottom:1.5rem;">
        Your role <strong style="color:#f97316;">${user?.role?.toUpperCase() || 'UNKNOWN'}</strong>
        does not have permission to access the
        <strong style="color:#ef4444;">${requestedRole.toUpperCase()} Dashboard</strong>.
      </p>
      <p style="color:rgba(255,255,255,0.3);font-size:13px;">
        Contact your administrator if you believe this is an error.
      </p>
      <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
        <button onclick="window.__returnToOwnDashboard()" class="btn btn-primary" style="min-width:160px;">
          Go to My Dashboard
        </button>
      </div>
    </div>
  `;
}

// ─── Dashboard Controls ─────────────────────────────────────────────────────────

export function initDashboardManager() {
  const modal = qs('#dashboard-modal');
  const openBtns = qsa('.open-dash-btn');
  const closeBtn = qs('#dash-close-btn');
  const roleBtns = qsa('.role-tab-btn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-role') || 'member';

      if (!isAuthenticated()) {
        // Not logged in — show Auth Modal, then open dashboard on success
        openAuthModal('login', () => openDashboard(role));
        return;
      }

      openDashboard(role);
    });
  });

  closeBtn?.addEventListener('click', () => closeDashboard());

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.getAttribute('data-role');
      currentTab = 'overview';
      updateDashboard();
    });
  });

  // Expose helper for 403 "Go to My Dashboard" button
  window.__returnToOwnDashboard = () => {
    const user = getCurrentUser();
    if (user) {
      currentRole = user.role;
      currentTab = 'overview';
      updateDashboard();
    }
  };

  // Subscribe to auth state changes to update role tab visibility
  onAuthChange((user) => {
    updateRoleTabVisibility(user);
  });
}

export function openDashboard(role = 'member') {
  const modal = qs('#dashboard-modal');
  if (!modal) return;

  // Auth Guard
  if (!isAuthenticated()) {
    openAuthModal('login', () => openDashboard(role));
    return;
  }

  currentRole = role;
  currentTab = 'overview';

  qsa('.role-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-role') === role);
  });

  modal.classList.add('active');
  lockScroll();
  updateDashboard();
}

export function closeDashboard() {
  const modal = qs('#dashboard-modal');
  if (!modal) return;
  modal.classList.remove('active');
  unlockScroll();
}

function updateDashboard() {
  const sidebar = qs('#dash-sidebar');
  const content = qs('#dash-content');

  // RBAC Check — enforce role access
  const hasAccess = canAccessDashboard(currentRole);

  if (sidebar) {
    sidebar.innerHTML = renderSidebar(currentRole, currentTab);
    attachSidebarListeners();
  }

  if (content) {
    if (!hasAccess) {
      // 403 Guard — wrong role
      content.innerHTML = render403View(currentRole);
      return;
    }

    if (currentTab === 'scanner') {
      content.innerHTML = renderQRScannerView();
    } else if (currentTab === 'calendar' || currentTab === 'classes') {
      content.innerHTML = renderCalendarView();
    } else if (currentRole === 'admin') {
      content.innerHTML = renderAdminView(currentTab);
    } else if (currentRole === 'trainer') {
      content.innerHTML = renderTrainerView(currentTab);
    } else {
      content.innerHTML = renderMemberView(currentTab);
    }

    attachActionListeners();
  }
}

/**
 * Show/hide dashboard role tabs based on user role.
 * Admin sees all 3. Trainer sees trainer + member. Member sees only member.
 */
function updateRoleTabVisibility(user) {
  const roleBtns = qsa('.role-tab-btn');
  roleBtns.forEach(btn => {
    const role = btn.getAttribute('data-role');
    if (!user) {
      // Guest — hide all role tabs
      btn.style.display = 'none';
    } else if (user.role === 'admin') {
      btn.style.display = '';
    } else if (user.role === 'trainer') {
      btn.style.display = (role === 'admin') ? 'none' : '';
    } else {
      // Member
      btn.style.display = (role === 'member') ? '' : 'none';
    }
  });
}

function attachSidebarListeners() {
  qsa('.dash-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      qsa('.dash-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentTab = item.getAttribute('data-tab');
      updateDashboard();
    });
  });
}

function attachActionListeners() {
  qs('#btn-export-pdf')?.addEventListener('click', () => {
    exportToPDF('Revenue & Member Report', ['Invoice', 'Member', 'Plan', 'Amount', 'Status'], [
      { invoice: '#INV-8921', member: 'Rahul Sharma', plan: 'Quarterly', amount: '₹2,499', status: 'Paid' },
      { invoice: '#INV-8920', member: 'Priya Verma', plan: 'Yearly', amount: '₹7,999', status: 'Paid' }
    ]);
  });

  qs('#btn-export-excel')?.addEventListener('click', () => {
    exportToExcel('Revenue_Report', ['Invoice', 'Member', 'Plan', 'Amount', 'Status'], [
      { invoice: '#INV-8921', member: 'Rahul Sharma', plan: 'Quarterly', amount: '₹2,499', status: 'Paid' },
      { invoice: '#INV-8920', member: 'Priya Verma', plan: 'Yearly', amount: '₹7,999', status: 'Paid' }
    ]);
  });

  qs('#btn-razorpay')?.addEventListener('click', () => triggerRazorpayCheckout('Quarterly Membership', 2499));
  qs('#btn-stripe')?.addEventListener('click', () => triggerStripeCheckout('Quarterly Membership', 2499));
}
