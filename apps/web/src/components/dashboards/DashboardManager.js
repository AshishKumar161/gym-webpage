/**
 * Unified Dashboard Manager — Controls modal visibility, role switching, and view rendering.
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

let currentRole = 'admin';
let currentTab = 'overview';

export function initDashboardManager() {
  const modal = qs('#dashboard-modal');
  const openBtns = qsa('.open-dash-btn');
  const closeBtn = qs('#dash-close-btn');
  const roleBtns = qsa('.role-tab-btn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-role') || 'admin';
      openDashboard(role);
    });
  });

  closeBtn?.addEventListener('click', () => {
    closeDashboard();
  });

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.getAttribute('data-role');
      currentTab = 'overview';
      updateDashboard();
    });
  });
}

export function openDashboard(role = 'admin') {
  const modal = qs('#dashboard-modal');
  if (!modal) return;

  currentRole = role;
  currentTab = 'overview';

  qsa('.role-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
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

  if (sidebar) {
    sidebar.innerHTML = renderSidebar(currentRole, currentTab);
    attachSidebarListeners();
  }

  if (content) {
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
