import { safeFetchApi, getCurrentUser } from '../../../utils/auth.js';

export async function renderMemberOverview() {
  const user = getCurrentUser();
  if (!user) return '<div class="dash-card">Please log in.</div>';

  let memberships = [];
  let attendance = [];
  let announcements = [];

  try {
    const [dashRes, attendanceRes, annRes] = await Promise.all([
      safeFetchApi('/memberships'),
      safeFetchApi('/attendance/history'),
      safeFetchApi('/communication/announcements')
    ]);
    memberships = dashRes?.data || [];
    attendance = attendanceRes?.data || [];
    announcements = annRes?.data || [];
  } catch (err) {}

  const activePlan = memberships.length > 0 ? memberships[0].name : 'No Active Plan';
  const isActive = memberships.length > 0;
  const announcementBanner = announcements.length > 0 
    ? `<div class="glass-card" style="margin-bottom:2rem; padding:1rem; border-left:4px solid var(--accent-cyan); background:rgba(0,188,212,0.1);">
         <strong>📢 ${announcements[0].title}</strong>: ${announcements[0].content}
       </div>` 
    : '';

  return `
    ${announcementBanner}
    <h2 class="dash-header-title">Welcome back, ${user?.name?.split(' ')[0] || 'Member'}! 👋</h2>
    <p class="dash-subtitle">Here is your daily fitness breakdown and active membership status.</p>

    <div class="dash-metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-icon">💳</div>
        <div class="metric-data">
          <strong>${activePlan}</strong>
          <span style="color:var(${isActive ? '--green' : '--text-secondary'})">
            ${isActive ? 'Active Plan' : 'Subscribe Now'}
          </span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">📅</div>
        <div class="metric-data">
          <strong>18 Days</strong>
          <span>Attendance This Month</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">🔥</div>
        <div class="metric-data">
          <strong>2,200 kcal</strong>
          <span>Daily Target</span>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
      <div class="glass-card" style="padding:2rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">🏋️ Today's Workout</h3>
        <p style="color:var(--accent-cyan); font-weight:700; margin-bottom:0.5rem;">Push Day — Chest & Triceps</p>
        <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
          <li>✓ Barbell Bench Press: 4 x 10</li>
          <li>✓ Incline DB Press: 3 x 12</li>
          <li>✓ Cable Flyes: 3 x 15</li>
          <li>✓ Triceps Rope Pushdown: 4 x 15</li>
        </ul>
        <button class="btn btn-outline" style="margin-top:1.5rem; width:100%;" onclick="alert('Viewing full plan')">View Full Plan</button>
      </div>

      <div class="glass-card" style="padding:2rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">🥗 Today's Diet Plan</h3>
        <p style="color:var(--green); font-weight:700; margin-bottom:0.5rem;">High Protein Shred (2,200 kcal)</p>
        <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
          <li>🍳 Breakfast: Oats + 4 Egg Whites</li>
          <li>🍗 Lunch: 200g Chicken Breast + Rice</li>
          <li>🥛 Snack: Whey Protein + Almonds</li>
          <li>🐟 Dinner: Grilled Salmon + Salad</li>
        </ul>
        <button class="btn btn-outline" style="margin-top:1.5rem; width:100%;" onclick="alert('Viewing full diet')">View Full Diet</button>
      </div>
    </div>
  `;
}
