import { safeFetchApi } from '../../../utils/auth.js';

export async function renderTrainerMembers() {
  let members = [];
  try {
    // Assuming backend handles filtering assigned members for this trainer implicitly based on token
    const data = await safeFetchApi('/users');
    members = Array.isArray(data) ? data.filter(u => u.role === 'MEMBER') : [];
  } catch (err) {}

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">My Assigned Members</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View and manage your clients.</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <input type="text" class="form-control" placeholder="Search members..." style="width: 250px;" />
        <button class="btn btn-primary" onclick="alert('Searching...')">Search</button>
      </div>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Goal</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(user => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                  <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-surface-2); display:flex; align-items:center; justify-content:center; font-weight:700;">
                    ${user.name.charAt(0).toUpperCase()}
                  </div>
                  <strong>${user.name}</strong>
                </div>
              </td>
              <td>${user.email}</td>
              <td><span style="color:var(--text-secondary)">Weight Loss</span></td>
              <td><span class="badge-status badge-active">Active</span></td>
              <td>
                <button class="table-action-btn" onclick="alert('Viewing profile for ${user.name}')">View Profile</button>
                <button class="table-action-btn" style="color:var(--accent-cyan);" onclick="alert('Messaging ${user.name}')">Message</button>
              </td>
            </tr>
          `).join('')}
          ${members.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No members assigned yet.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
