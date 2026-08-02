/**
 * Sidebar Component — Role-based sidebar menu items.
 */

export const ADMIN_NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Dashboard & Revenue' },
  { id: 'members', icon: '👥', label: 'Manage Members' },
  { id: 'trainers', icon: '👨‍🏫', label: 'Manage Trainers' },
  { id: 'staff', icon: '👔', label: 'Manage Staff' },
  { id: 'attendance', icon: '📅', label: 'Attendance Logs' },
  { id: 'plans', icon: '💳', label: 'Membership Plans' },
  { id: 'payments', icon: '🧾', label: 'Payments & Invoices' },
  { id: 'classes', icon: '🏋️', label: 'Manage Classes' },
  { id: 'coupons', icon: '🎟️', label: 'Manage Coupons' },
  { id: 'blogs', icon: '📝', label: 'Manage Blogs' },
  { id: 'reviews', icon: '⭐', label: 'Manage Reviews' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
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
  { id: 'videos', icon: '🎥', label: 'Video Uploads' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' }
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
  { id: 'calculator', icon: '🧮', label: 'BMI & Calorie Calc' },
  { id: 'goals', icon: '🎯', label: 'Fitness Goals' },
  { id: 'book-class', icon: '🕒', label: 'Book a Class' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' }
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
