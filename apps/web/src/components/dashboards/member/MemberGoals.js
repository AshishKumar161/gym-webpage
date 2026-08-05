export async function renderMemberGoals() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Fitness Goals & Milestones</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Track your achievements and unlock gym badges.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Creating New Goal...')">+ Create New Goal</button>
    </div>

    <div class="dash-metrics-grid" style="margin-bottom:2.5rem;">
      <div class="metric-card glass-card" style="border:1px solid var(--accent-cyan);">
        <div class="metric-icon">🏆</div>
        <div class="metric-data">
          <strong>12</strong>
          <span>Goals Completed</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">🎖️</div>
        <div class="metric-data">
          <strong>4</strong>
          <span>Active Badges</span>
        </div>
      </div>
    </div>

    <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Active Goals</h3>
    <div style="display:grid; gap:1rem;">
      <div class="glass-card" style="padding:1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="flex:1;">
          <h4 style="font-size:1.1rem; margin-bottom:0.3rem;">Lose 5kg Body Fat</h4>
          <div style="background:var(--bg-surface-2); height:8px; border-radius:4px; margin-top:0.8rem; overflow:hidden;">
            <div style="background:var(--accent-cyan); width:60%; height:100%;"></div>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.4rem;">3kg / 5kg (60%)</p>
        </div>
        <button class="btn btn-outline" style="margin-left:2rem;" onclick="alert('Updating Progress...')">Update Progress</button>
      </div>

      <div class="glass-card" style="padding:1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="flex:1;">
          <h4 style="font-size:1.1rem; margin-bottom:0.3rem;">Attend 20 Classes</h4>
          <div style="background:var(--bg-surface-2); height:8px; border-radius:4px; margin-top:0.8rem; overflow:hidden;">
            <div style="background:var(--green); width:90%; height:100%;"></div>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.4rem;">18 / 20 Classes (90%)</p>
        </div>
        <button class="btn btn-outline" style="margin-left:2rem;" onclick="alert('Updating Progress...')">Update Progress</button>
      </div>
    </div>
  `;
}
