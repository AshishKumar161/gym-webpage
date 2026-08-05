import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminAnalytics() {
  // We will build the skeleton first, then load the data and chart.js asynchronously
  
  setTimeout(() => initAnalytics(), 100);

  return `
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
      <div>
        <h2 class="dash-header-title">Business Intelligence & Analytics</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Live performance metrics and revenue tracking.</p>
      </div>
      <div style="display:flex; gap:1rem;">
        <button class="btn btn-outline" onclick="window.downloadCSV()">📥 Export CSV</button>
      </div>
    </div>

    <!-- Executive Summary KPIs -->
    <div id="bi-kpis" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
      <div class="glass-card" style="padding:1.5rem; text-align:center;">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">💵</div>
        <h3 id="kpi-total-revenue" style="font-size:1.5rem; font-family:var(--font-display);">...</h3>
        <span style="color:var(--text-secondary); font-size:0.9rem;">Total Revenue</span>
      </div>
      <div class="glass-card" style="padding:1.5rem; text-align:center;">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">📈</div>
        <h3 id="kpi-monthly-revenue" style="font-size:1.5rem; font-family:var(--font-display); color:var(--accent-cyan);">...</h3>
        <span style="color:var(--text-secondary); font-size:0.9rem;">Monthly Revenue</span>
      </div>
      <div class="glass-card" style="padding:1.5rem; text-align:center;">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">👥</div>
        <h3 id="kpi-active-members" style="font-size:1.5rem; font-family:var(--font-display);">...</h3>
        <span style="color:var(--text-secondary); font-size:0.9rem;">Active Members</span>
      </div>
      <div class="glass-card" style="padding:1.5rem; text-align:center;">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">🆕</div>
        <h3 id="kpi-new-regs" style="font-size:1.5rem; font-family:var(--font-display);">...</h3>
        <span style="color:var(--text-secondary); font-size:0.9rem;">New (This Month)</span>
      </div>
      <div class="glass-card" style="padding:1.5rem; text-align:center; border: 1px solid #ef4444;">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">⚠️</div>
        <h3 id="kpi-expiring" style="font-size:1.5rem; font-family:var(--font-display); color:#ef4444;">...</h3>
        <span style="color:var(--text-secondary); font-size:0.9rem;">Expiring Soon</span>
      </div>
    </div>

    <!-- AI Insights Banner -->
    <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem; background: rgba(139, 92, 246, 0.1); border-left: 4px solid var(--accent);">
      <h3 style="font-family:var(--font-display); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:1.5rem;">🤖</span> AI Business Insights & Forecasting
      </h3>
      <div id="ai-insights-content" style="color:var(--text-secondary); font-size:0.95rem; line-height:1.6;">
        Generating forecasts...
      </div>
    </div>

    <!-- Charts Grid -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap:2rem;">
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Revenue Trends (Last 30 Days)</h3>
        <canvas id="revenueChart"></canvas>
      </div>
      
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Membership Distribution</h3>
        <canvas id="membershipChart"></canvas>
      </div>

      <div class="glass-card" style="padding:1.5rem; grid-column: 1 / -1;">
        <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Peak Attendance Heatmap</h3>
        <canvas id="attendanceChart" style="max-height: 300px;"></canvas>
      </div>
    </div>
  `;
}

async function initAnalytics() {
  try {
    // 1. Fetch Executive Summary
    const execRes = await safeFetchApi('/bi/executive-summary');
    if (execRes?.data) {
      document.getElementById('kpi-total-revenue').textContent = `₹${execRes.data.totalRevenue.toLocaleString()}`;
      document.getElementById('kpi-monthly-revenue').textContent = `₹${execRes.data.monthlyRevenue.toLocaleString()}`;
      document.getElementById('kpi-active-members').textContent = execRes.data.activeMembers;
      document.getElementById('kpi-new-regs').textContent = execRes.data.newRegistrations;
      document.getElementById('kpi-expiring').textContent = execRes.data.expiringSoon;
    }

    // 2. Fetch AI Insights
    safeFetchApi('/bi/ai-forecast').then(res => {
      const container = document.getElementById('ai-insights-content');
      if (res?.data?.insights) {
        // Simple markdown parsing for bold and bullets
        const html = res.data.insights
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\*/g, '<br>•')
          .replace(/\n-/g, '<br>•');
        container.innerHTML = html;
      } else {
        container.innerHTML = 'AI Insights currently unavailable.';
      }
    });

    // 3. Load Chart.js dynamically if not present
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => loadCharts();
      document.head.appendChild(script);
    } else {
      loadCharts();
    }

  } catch (err) {
    console.error('Analytics load failed:', err);
  }
}

async function loadCharts() {
  const [revRes, memRes, attRes] = await Promise.all([
    safeFetchApi('/bi/revenue-trends'),
    safeFetchApi('/bi/membership-distribution'),
    safeFetchApi('/bi/attendance-analytics')
  ]);

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Inter, sans-serif';

  // Revenue Chart (Line)
  if (revRes?.data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: revRes.data.labels,
        datasets: [{
          label: 'Daily Revenue (₹)',
          data: revRes.data.values,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    });
  }

  // Membership Chart (Doughnut)
  if (memRes?.data) {
    const ctx = document.getElementById('membershipChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: memRes.data.labels,
        datasets: [{
          data: memRes.data.values,
          backgroundColor: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      }
    });
  }

  // Attendance Chart (Bar)
  if (attRes?.data?.peakHours) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: attRes.data.peakHours.labels,
        datasets: [{
          label: 'Check-ins by Hour',
          data: attRes.data.peakHours.values,
          backgroundColor: '#8b5cf6',
          borderRadius: 4
        }]
      }
    });
  }
}

window.downloadCSV = async () => {
  try {
    const res = await safeFetchApi('/bi/executive-summary');
    if (!res?.data) return;
    
    let csv = "KPI,Value\n";
    csv += `Total Revenue,${res.data.totalRevenue}\n`;
    csv += `Monthly Revenue,${res.data.monthlyRevenue}\n`;
    csv += `Active Members,${res.data.activeMembers}\n`;
    csv += `New Registrations,${res.data.newRegistrations}\n`;
    csv += `Expiring Soon,${res.data.expiringSoon}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `A2_Gym_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  } catch(err) {
    console.error('Export failed', err);
  }
};
