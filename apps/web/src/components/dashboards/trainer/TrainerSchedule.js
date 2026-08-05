export async function renderTrainerSchedule() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">My Schedule</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Manage your personal training sessions and group classes.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Opening Add Session Modal...')">+ Add Session</button>
    </div>

    <div class="glass-card" style="padding:2rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
        <h3 style="font-family:var(--font-display);">October 2026</h3>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline" style="padding:0.4rem 0.8rem;">&lt;</button>
          <button class="btn btn-outline" style="padding:0.4rem 0.8rem;">&gt;</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:0.5rem; text-align:center; font-weight:700; color:var(--text-secondary); margin-bottom:1rem;">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      
      <!-- Mock Calendar Grid -->
      <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:0.5rem; min-height:400px;">
        ${Array.from({length: 31}).map((_, i) => `
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:0.5rem; min-height:80px; text-align:right;">
            <span style="font-size:0.9rem; color:rgba(255,255,255,0.5);">${i + 1}</span>
            ${i === 14 ? `
              <div style="background:var(--accent-cyan); color:#000; padding:0.2rem; border-radius:4px; font-size:0.7rem; text-align:left; margin-top:0.5rem; cursor:pointer;" onclick="alert('Session: John Doe (09:00 AM)')">
                09:00 - John Doe
              </div>
            ` : ''}
            ${i === 16 ? `
              <div style="background:var(--green); color:#000; padding:0.2rem; border-radius:4px; font-size:0.7rem; text-align:left; margin-top:0.5rem; cursor:pointer;" onclick="alert('Class: HIIT (11:00 AM)')">
                11:00 - HIIT
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
