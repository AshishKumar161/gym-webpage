/**
 * Admin Dashboard View Renderer with Charts, Analytics, Export PDF/Excel, and CRUD.
 */
import { exportToPDF, exportToExcel } from '../../utils/export.js';
import { renderRevenueChart, renderAttendanceChart } from './Charts.js';

export function renderAdminView(tab) {
  setTimeout(() => {
    if (tab === 'overview') {
      renderRevenueChart('revenue-chart');
      renderAttendanceChart('attendance-chart');
    }
  }, 100);

  switch (tab) {
    case 'overview':
    default:
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <div>
            <h2 class="dash-header-title">Admin Analytics & System Overview</h2>
            <p class="dash-subtitle" style="margin-bottom:0;">Real-time revenue metrics, attendance trends, and automated report exports.</p>
          </div>
          <div style="display:flex; gap:0.6rem;">
            <button class="btn btn-outline" id="btn-export-pdf" style="padding:0.5rem 1rem; font-size:0.85rem;">📄 Export PDF Report</button>
            <button class="btn btn-outline" id="btn-export-excel" style="padding:0.5rem 1rem; font-size:0.85rem;">📊 Export Excel CSV</button>
          </div>
        </div>

        <div class="dash-metrics-grid">
          <div class="metric-card glass-card">
            <div class="metric-icon">💰</div>
            <div class="metric-data">
              <strong>₹4,85,000</strong>
              <span>Monthly Revenue</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">👥</div>
            <div class="metric-data">
              <strong>352</strong>
              <span>Active Members</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">👨‍🏫</div>
            <div class="metric-data">
              <strong>8</strong>
              <span>Certified Trainers</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">📲</div>
            <div class="metric-data">
              <strong>142</strong>
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
      `;

    case 'members':
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <div>
            <h2 class="dash-header-title">Manage Members</h2>
            <p class="dash-subtitle" style="margin-bottom:0;">View, add, edit, and deactivate gym member accounts.</p>
          </div>
          <button class="btn btn-primary" onclick="alert('Open Add Member Modal')">+ Add New Member</button>
        </div>

        <div class="dash-table-wrap">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Rahul Sharma</td><td>rahul.s@example.com</td><td>+91 98765 43210</td><td>Quarterly</td><td><span class="badge-status badge-active">Active</span></td><td><button class="table-action-btn">Edit</button></td></tr>
              <tr><td>Priya Verma</td><td>priya.v@example.com</td><td>+91 98123 45678</td><td>Yearly</td><td><span class="badge-status badge-active">Active</span></td><td><button class="table-action-btn">Edit</button></td></tr>
            </tbody>
          </table>
        </div>
      `;
  }
}
