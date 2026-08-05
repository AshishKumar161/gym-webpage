import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminPayments() {
  let payments = [];
  try {
    const data = await safeFetchApi('/payments/history').catch(() => []);
    payments = Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    payments = [];
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Payment Dashboard</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Revenue, transactions, invoices, and pending payments.</p>
      </div>
      <div style="display:flex; gap:0.6rem;">
        <button class="btn btn-outline" id="btn-export-pdf" onclick="alert('Exporting PDF...')">📄 Export PDF</button>
        <button class="btn btn-outline" id="btn-export-excel" onclick="alert('Exporting CSV...')">📊 Export CSV</button>
      </div>
    </div>

    <div class="dash-metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-icon">💰</div>
        <div class="metric-data">
          <strong>₹${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}</strong>
          <span>Total Revenue</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">💳</div>
        <div class="metric-data">
          <strong>${payments.length}</strong>
          <span>Total Transactions</span>
        </div>
      </div>
    </div>

    <div class="dash-table-wrap" style="margin-top:2rem;">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Transaction ID</th><th>User ID</th><th>Amount (₹)</th><th>Status</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => `
            <tr>
              <td>${p.id}</td>
              <td>${p.userId}</td>
              <td>₹${(p.amount || 0).toLocaleString('en-IN')}</td>
              <td><span class="badge-status badge-${p.status === 'SUCCESS' ? 'active' : 'inactive'}">${p.status}</span></td>
              <td>${new Date(p.createdAt).toLocaleDateString()}</td>
              <td>
                <button class="table-action-btn" onclick="alert('Viewing Invoice ${p.id}')">View Invoice</button>
                <button class="table-action-btn" style="color:#f97316;" onclick="alert('Processing Refund for ${p.id}')">Refund</button>
              </td>
            </tr>
          `).join('')}
          ${payments.length === 0 ? `<tr><td colspan="6" style="text-align:center;">No payment records found.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
