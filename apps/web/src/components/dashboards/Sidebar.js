/**
 * Sidebar Component — Role-based sidebar menu items.
 */

export const ADMIN_NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Dashboard & Revenue' },
  { id: 'members', icon: '👥', label: 'Manage Members' },
  { id: 'trainers', icon: '👨‍🏫', label: 'Manage Trainers' },
  { id: 'plans', icon: '💳', label: 'Membership Plans' },
  { id: 'attendance', icon: '📅', label: 'Attendance Logs' },
  { id: 'payments', icon: '🧾', label: 'Payments & Invoices' },
  { id: 'inventory', icon: '📦', label: 'Inventory' },
  { id: 'pos', icon: '🛒', label: 'Point of Sale' },
  { id: 'assets', icon: '🏋️', label: 'Assets & Equipment' },
  { id: 'suppliers', icon: '🚚', label: 'Suppliers & PO' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'analytics', icon: '📊', label: 'BI Analytics' },
  { id: 'settings', icon: '⚙️', label: 'System Settings' }
];

export const TRAINER_NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Trainer Overview' },
  { id: 'assigned-members', icon: '👥', label: 'Assigned Members' },
  { id: 'workouts', icon: '🏋️', label: 'Workout Plan Builder' },
  { id: 'diets', icon: '🥗', label: 'Diet Plan Builder' },
  { id: 'attendance', icon: '📅', label: 'Attendance' },
  { id: 'classes', icon: '🕒', label: 'Schedule Classes' },
  { id: 'progress', icon: '📈', label: 'Progress Reports' },
  { id: 'chat', icon: '💬', label: 'Direct Chat' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'profile', icon: '👤', label: 'My Profile' }
];

export const MEMBER_NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Member Overview' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'membership', icon: '💳', label: 'My Membership' },
  { id: 'payments', icon: '🧾', label: 'Invoices & Payments' },
  { id: 'workouts', icon: '🏋️', label: 'My Workout Plan' },
  { id: 'diets', icon: '🥗', label: 'My Diet Plan' },
  { id: 'qr-checkin', icon: '📲', label: 'QR Check-in' },
  { id: 'attendance', icon: '📅', label: 'My Attendance' },
  { id: 'progress', icon: '📉', label: 'My Progress & BMI' },
  { id: 'goals', icon: '🎯', label: 'Fitness Goals' },
  { id: 'store', icon: '🏪', label: 'Gym Store' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'settings', icon: '⚙️', label: 'System Settings' }
];

export function renderSidebar(role, activeTab, onSelectTab) {
  let items = MEMBER_NAV_ITEMS;
  if (role === 'admin') items = ADMIN_NAV_ITEMS;
  if (role === 'trainer') items = TRAINER_NAV_ITEMS;

  return items
    .map(
      item => `
    <div class="dash-nav-item ${item.id === activeTab ? 'active' : ''}" data-tab="${item.id}">
      <span>${item.icon}</span>
      <span>${item.label}</span>
    </div>
  `
    )
    .join('');
}
