import { safeFetchApi } from '../../utils/auth.js';
import { qs } from '../../utils/dom.js';

export class NotificationWidget {
  constructor() {
    this.bellBtn = qs('#notification-bell');
    this.badge = qs('#notification-badge');
    this.dropdown = qs('#notification-dropdown');
    this.list = qs('#notification-list');
    this.markAllBtn = qs('#mark-all-read-btn');

    if (!this.bellBtn) return;

    this.bindEvents();
    this.fetchNotifications();
  }

  bindEvents() {
    this.bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = this.dropdown.style.display === 'flex';
      this.dropdown.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) this.fetchNotifications(); // Refresh on open
    });

    document.addEventListener('click', (e) => {
      if (this.dropdown && !this.bellBtn.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.dropdown.style.display = 'none';
      }
    });

    this.markAllBtn?.addEventListener('click', async () => {
      try {
        await safeFetchApi('/communication/notifications/read-all', { method: 'PUT' });
        this.fetchNotifications();
      } catch (err) {
        console.error('Failed to mark all as read', err);
      }
    });
  }

  async fetchNotifications() {
    try {
      // 1. Fetch unread count
      const countRes = await safeFetchApi('/communication/notifications/unread-count');
      const count = countRes.data || 0;
      
      if (count > 0) {
        this.badge.textContent = count > 99 ? '99+' : count;
        this.badge.style.display = 'block';
      } else {
        this.badge.style.display = 'none';
      }

      // 2. Fetch recent list if dropdown is open
      if (this.dropdown.style.display === 'flex') {
        const notifRes = await safeFetchApi('/communication/notifications');
        this.renderList(notifRes.data || []);
      }
    } catch (err) {
      console.error('Notification fetch failed:', err);
    }
  }

  renderList(notifications) {
    if (notifications.length === 0) {
      this.list.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">No notifications found.</div>`;
      return;
    }

    this.list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.isRead ? 'read' : 'unread'}" style="padding:1rem; border-bottom:1px solid var(--border); display:flex; gap:1rem; align-items:flex-start; ${n.isRead ? 'opacity:0.7;' : 'background:rgba(14,165,233,0.05);'} cursor:pointer;" data-id="${n.id}" data-url="${n.actionUrl || ''}">
        <div style="font-size:1.5rem;">${this.getIcon(n.type)}</div>
        <div style="flex:1;">
          <strong style="display:block; font-size:0.95rem; margin-bottom:0.2rem; color:var(--text);">${n.title}</strong>
          <p style="margin:0; font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${n.message}</p>
          <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem; display:block;">${new Date(n.createdAt).toLocaleString()}</span>
        </div>
      </div>
    `).join('');

    // Attach click listeners to individual items
    this.list.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.getAttribute('data-id');
        const url = item.getAttribute('data-url');

        // Mark as read
        if (item.classList.contains('unread')) {
          await safeFetchApi(`/communication/notifications/${id}/read`, { method: 'PUT' });
          this.fetchNotifications(); // refresh badge
        }

        if (url) {
          // If it has an action URL, we could navigate. For now, close dropdown.
          this.dropdown.style.display = 'none';
          alert('Navigate to: ' + url); // Placeholder for actual navigation
        }
      });
    });
  }

  getIcon(type) {
    switch (type.toLowerCase()) {
      case 'message': return '💬';
      case 'payment': return '💳';
      case 'workout': return '🏋️';
      case 'diet': return '🥗';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  }
}
