/**
 * CalendarView Component — Monthly Interactive Class & Event Scheduling Calendar.
 */

export function renderCalendarView() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return `
    <h2 class="dash-header-title">Class & Event Schedule Calendar</h2>
    <p class="dash-subtitle">August 2026 — View group fitness schedules and special gym events.</p>

    <div class="glass-card" style="padding:1.5rem; overflow-x:auto;">
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.5rem; text-align:center; font-weight:700; font-family:var(--font-display); color:var(--text-muted); margin-bottom:0.8rem;">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.5rem;">
        ${days
          .map(d => {
            const hasClass = [3, 5, 10, 12, 17, 19, 24, 26].includes(d);
            return `
            <div style="min-height:75px; background:var(--bg-surface-2); border:1px solid var(--border); border-radius:var(--r-sm); padding:0.5rem; display:flex; flex-direction:column; justify-content:space-between; ${hasClass ? 'border-color:var(--accent-cyan);' : ''}">
              <span style="font-weight:700; font-size:0.85rem;">${d}</span>
              ${hasClass ? '<span style="font-size:0.68rem; background:rgba(6,182,212,0.15); color:var(--accent-cyan); padding:2px 4px; border-radius:3px; font-weight:700;">7AM HIIT</span>' : ''}
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}
