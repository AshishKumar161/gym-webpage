import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminPlans() {
  const data = await safeFetchApi('/memberships');
  const plans = Array.isArray(data) ? data : (data?.data || []);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Membership Plans</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Create, edit, and manage subscription plans and pricing.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Open Create Plan Modal')">+ Create New Plan</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Plan Name</th><th>Duration (Months)</th><th>Price (₹)</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${plans.map(p => `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td>${p.durationMonths}</td>
              <td>₹${p.price.toLocaleString('en-IN')}</td>
              <td><span class="badge-status badge-active">Active</span></td>
              <td>
                <button class="table-action-btn" onclick="alert('Editing Plan ${p.id}')">Edit</button>
                <button class="table-action-btn" style="color:#f97316;" onclick="alert('Freezing Plan ${p.id}')">Freeze</button>
                <button class="table-action-btn" style="color:#ef4444;" onclick="alert('Deleting Plan ${p.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
          ${plans.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No plans available.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
