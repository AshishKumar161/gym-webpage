import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminMembers() {
  const data = await safeFetchApi('/admin/users');
  const users = data?.users || [];
  const members = users.filter(u => u.role === 'MEMBER');

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Manage Members</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Search, filter, and manage gym member accounts.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Open Add Member Modal')">+ Add New Member</button>
    </div>

    <div style="margin-bottom: 1.5rem; display:flex; gap:1rem;">
      <input type="text" placeholder="Search members by name or email..." class="form-control" style="max-width:300px;" />
      <button class="btn btn-outline">Filter</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.phone || 'N/A'}</td>
              <td><span class="badge-status badge-active">Active</span></td>
              <td>
                <button class="table-action-btn" onclick="alert('Viewing Member ${u.id}')">View</button>
                <button class="table-action-btn" onclick="alert('Editing Member ${u.id}')">Edit</button>
                <button class="table-action-btn" style="color:#ef4444;" onclick="alert('Suspending Member ${u.id}')">Suspend</button>
              </td>
            </tr>
          `).join('')}
          ${members.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No members found.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
