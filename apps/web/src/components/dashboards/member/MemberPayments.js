import { safeFetchApi } from '../../../utils/auth.js';
import { exportToPDF } from '../../../utils/export.js';

export async function renderMemberPayments() {
  let payments = [];
  try {
    const res = await safeFetchApi('/payments/invoices');
    payments = res.data || [];
  } catch (err) {}

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Invoices & Payment Receipts</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View your transaction history and download PDF receipts.</p>
      </div>
      <button class="btn btn-outline" onclick="alert('Downloading Statement...')">📄 Download Statement</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => `
            <tr>
              <td>${p.invoiceNumber}</td>
              <td>₹${(p.amount || 0).toLocaleString('en-IN')}</td>
              <td>${new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
              <td><span class="badge-status badge-${p.status === 'PAID' ? 'active' : 'inactive'}">${p.status}</span></td>
              <td>
                <button class="table-action-btn" onclick="alert('Downloading Receipt for ${p.invoiceNumber}...')">📥 Download PDF</button>
              </td>
            </tr>
          `).join('')}
          ${payments.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No payment records found.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
