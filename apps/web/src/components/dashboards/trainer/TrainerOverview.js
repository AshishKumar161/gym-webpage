import { safeFetchApi, getCurrentUser } from '../../../utils/auth.js';

export async function renderTrainerOverview() {
  const user = getCurrentUser();
  let assignedMembers = [];
  try {
    const data = await safeFetchApi('/users');
    assignedMembers = Array.isArray(data) ? data.filter(u => u.role === 'MEMBER') : [];
  } catch (err) {}

  return `
    <h2 class="dash-header-title">Welcome back, ${user?.name?.split(' ')[0] || 'Trainer'}! 🏋️‍♂️</h2>
    <p class="dash-subtitle">Here is your daily training breakdown and assigned member stats.</p>

    <div class="dash-metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-icon">👥</div>
        <div class="metric-data">
          <strong>${assignedMembers.length}</strong>
          <span style="color:var(--text-secondary)">Assigned Members</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">🕒</div>
        <div class="metric-data">
          <strong>4</strong>
          <span>Sessions Today</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">⭐</div>
        <div class="metric-data">
          <strong>4.9</strong>
          <span>Client Rating</span>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
      <div class="glass-card" style="padding:2rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">📅 Today's Schedule</h3>
        <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
          <li style="display:flex; justify-content:space-between; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span>09:00 AM</span>
            <strong style="color:#fff;">John Doe (Personal)</strong>
          </li>
          <li style="display:flex; justify-content:space-between; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span>11:00 AM</span>
            <strong style="color:#fff;">HIIT Group Class</strong>
          </li>
          <li style="display:flex; justify-content:space-between; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span>02:00 PM</span>
            <strong style="color:#fff;">Jane Smith (Consult)</strong>
          </li>
          <li style="display:flex; justify-content:space-between; padding-bottom:0.5rem;">
            <span>05:00 PM</span>
            <strong style="color:#fff;">Yoga Class</strong>
          </li>
        </ul>
        <button class="btn btn-outline" style="margin-top:1.5rem; width:100%;" onclick="alert('Viewing full schedule')">View Full Schedule</button>
      </div>

      <div class="glass-card" style="padding:2rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">⚠️ Attention Required</h3>
        <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
          <li style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span>Mike J. missed 3 workouts</span>
            <button class="btn btn-primary" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="alert('Messaging Mike...')">Message</button>
          </li>
          <li style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span>Sarah W. diet check-in due</span>
            <button class="btn btn-primary" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="alert('Reviewing diet...')">Review</button>
          </li>
        </ul>
      </div>
    </div>
  `;
}
