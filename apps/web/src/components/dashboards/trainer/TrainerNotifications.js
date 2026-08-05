import { safeFetchApi } from '../../../utils/auth.js';

export async function renderTrainerNotifications() {
  let notifications = [];
  try {
    const data = await safeFetchApi('/notifications/my-notifications').catch(() => []);
    notifications = Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {}

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">System & Schedule Alerts</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View session reminders and administrative alerts.</p>
      </div>
      <button class="btn btn-outline" onclick="alert('Marked all as read.')">Mark All Read</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:1rem;">
      ${notifications.map(n => `
        <div class="glass-card" style="padding:1.5rem; display:flex; align-items:flex-start; gap:1rem; ${n.read ? 'opacity:0.7;' : 'border-left: 4px solid var(--accent-cyan);'}">
          <div style="font-size:1.5rem; margin-top:0.2rem;">🔔</div>
          <div style="flex:1;">
            <h4 style="font-size:1.1rem; margin-bottom:0.3rem;">${n.title || 'System Alert'}</h4>
            <p style="color:var(--text-secondary); margin-bottom:0.5rem;">${n.message || n.content}</p>
            <span style="font-size:0.8rem; color:rgba(255,255,255,0.4);">${new Date(n.createdAt).toLocaleString()}</span>
          </div>
          ${!n.read ? `<button class="btn btn-primary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="alert('Marked as read')">Mark Read</button>` : ''}
        </div>
      `).join('')}

      ${notifications.length === 0 ? `
        <div class="glass-card" style="padding:3rem; text-align:center;">
          <div style="font-size:3rem; margin-bottom:1rem;">📭</div>
          <h3 style="font-size:1.5rem; margin-bottom:0.5rem;">You're all caught up!</h3>
          <p style="color:var(--text-secondary);">You have no new alerts.</p>
        </div>
      ` : ''}
    </div>
  `;
}
