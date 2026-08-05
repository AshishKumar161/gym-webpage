import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminSuppliers() {
  setTimeout(() => initSuppliers(), 100);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <h2 class="dash-header-title">Supplier Management</h2>
      <button class="btn btn-primary" onclick="alert('Open Add Supplier Modal')">+ Add Supplier</button>
    </div>

    <div class="glass-card" style="padding:1.5rem; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
            <th style="padding:1rem;">Supplier Name</th>
            <th style="padding:1rem;">Contact Person</th>
            <th style="padding:1rem;">Email</th>
            <th style="padding:1rem;">Phone</th>
            <th style="padding:1rem; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="suppliers-table-body">
          <tr><td colspan="5" style="padding:1rem; text-align:center;">Loading suppliers...</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

async function initSuppliers() {
  try {
    const res = await safeFetchApi('/suppliers');
    const tbody = document.getElementById('suppliers-table-body');
    if (!res?.data || res.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:1rem; text-align:center;">No suppliers found</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.map(s => {
      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:1rem; font-weight:600;">${s.name}</td>
          <td style="padding:1rem;">${s.contactName || '-'}</td>
          <td style="padding:1rem;">${s.email || '-'}</td>
          <td style="padding:1rem;">${s.phone || '-'}</td>
          <td style="padding:1rem; text-align:right;">
            <button class="btn btn-outline btn-sm" onclick="alert('Create PO for ${s.id}')">📝 New PO</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load suppliers', err);
  }
}
