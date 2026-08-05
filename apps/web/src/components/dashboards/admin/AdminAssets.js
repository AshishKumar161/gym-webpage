import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminAssets() {
  setTimeout(() => initAssets(), 100);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <h2 class="dash-header-title">Asset & Equipment Management</h2>
      <button class="btn btn-primary" onclick="alert('Open Add Asset Modal')">+ Add Asset</button>
    </div>

    <div class="glass-card" style="padding:1.5rem; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
            <th style="padding:1rem;">Asset Tag</th>
            <th style="padding:1rem;">Name</th>
            <th style="padding:1rem;">Category</th>
            <th style="padding:1rem;">Status</th>
            <th style="padding:1rem; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="assets-table-body">
          <tr><td colspan="5" style="padding:1rem; text-align:center;">Loading assets...</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

async function initAssets() {
  try {
    const res = await safeFetchApi('/assets');
    const tbody = document.getElementById('assets-table-body');
    if (!res?.data || res.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:1rem; text-align:center;">No assets found</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.map(a => {
      let statusBadge = '';
      switch (a.status) {
        case 'ACTIVE': statusBadge = '<span style="background:var(--accent-cyan); color:#000; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Active</span>'; break;
        case 'MAINTENANCE': statusBadge = '<span style="background:#f59e0b; color:#000; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Under Maintenance</span>'; break;
        case 'RETIRED': statusBadge = '<span style="background:#ef4444; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Retired</span>'; break;
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:1rem; font-family:monospace;">${a.assetTag}</td>
          <td style="padding:1rem; font-weight:600;">${a.name}</td>
          <td style="padding:1rem;">${a.category}</td>
          <td style="padding:1rem;">${statusBadge}</td>
          <td style="padding:1rem; text-align:right;">
            <button class="btn btn-outline btn-sm" onclick="alert('Log maintenance for ${a.id}')">🔧 Log Maintenance</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load assets', err);
  }
}
