import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminOverview() {
  const analyticsData = await safeFetchApi('/admin/analytics');

  setTimeout(async () => {
    try {
      const { renderRevenueChart, renderAttendanceChart } = await import('../Charts.js');
      renderRevenueChart('revenue-chart');
      renderAttendanceChart('attendance-chart');
    } catch(e) {
      console.error(e);
    }
  }, 100);

  window.__generateAIInsights = async () => {
    const btn = document.getElementById('ai-insights-btn');
    const resultDiv = document.getElementById('ai-insights-result');
    
    btn.textContent = 'Generating Insights...';
    btn.disabled = true;
    resultDiv.innerHTML = '<div style="color:var(--accent-cyan); font-style:italic;">🧠 AI is analyzing business data...</div>';
    
    try {
      const res = await safeFetchApi('/ai/admin-insights');
      const text = res.data.text.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      resultDiv.innerHTML = `<div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:8px; font-size:0.95rem; line-height:1.6;">${text}</div>`;
    } catch (err) {
      resultDiv.innerHTML = `<div style="color:var(--red);">Error: ${err.message}</div>`;
    } finally {
      btn.textContent = 'Refresh Insights';
      btn.disabled = false;
    }
  };

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Admin Analytics & System Overview</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Real-time revenue metrics, attendance trends, and automated report exports.</p>
      </div>
      <div style="display:flex; gap:0.6rem;">
        <button class="btn btn-outline" id="btn-export-pdf" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="alert('Exporting PDF...')">📄 Export PDF Report</button>
        <button class="btn btn-outline" id="btn-export-excel" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="alert('Exporting Excel...')">📊 Export Excel CSV</button>
      </div>
    </div>

    <div class="dash-metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-icon">💰</div>
        <div class="metric-data">
          <strong>₹${(analyticsData?.totalRevenue || 0).toLocaleString('en-IN')}</strong>
          <span>Total Revenue</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">👥</div>
        <div class="metric-data">
          <strong>${analyticsData?.totalMembers || 0}</strong>
          <span>Active Members</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">👨‍🏫</div>
        <div class="metric-data">
          <strong>${analyticsData?.totalTrainers || 0}</strong>
          <span>Certified Trainers</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">📲</div>
        <div class="metric-data">
          <strong>${analyticsData?.todayCheckins || 0}</strong>
          <span>Today's Check-ins</span>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem; margin-bottom:2.5rem;">
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:800; margin-bottom:1rem;">📈 Monthly Revenue Growth (₹ Thousands)</h3>
        <canvas id="revenue-chart"></canvas>
      </div>
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:800; margin-bottom:1rem;">📅 Weekly Attendance Trend</h3>
        <canvas id="attendance-chart"></canvas>
      </div>
    </div>

    <!-- AI Business Insights -->
    <div class="glass-card" style="padding:2rem; margin-bottom:2.5rem; border-left:4px solid var(--accent-cyan);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.2rem; margin-bottom:0.2rem;">🤖 AI Business Insights</h3>
          <p style="color:var(--text-secondary); margin:0;">Predict churn, identify trends, and optimize revenue using AI analysis.</p>
        </div>
        <button id="ai-insights-btn" class="btn btn-primary" onclick="window.__generateAIInsights()">Generate Insights</button>
      </div>
      <div id="ai-insights-result"></div>
    </div>
  `;
}
