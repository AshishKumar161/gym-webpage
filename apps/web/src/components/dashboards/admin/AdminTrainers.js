import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminTrainers() {
  const data = await safeFetchApi('/admin/users');
  const users = data?.users || [];
  const trainers = users.filter(u => u.role === 'TRAINER');

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Manage Trainers</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View and assign trainers to gym sessions.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Open Add Trainer Modal')">+ Add Trainer</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Specialization</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${trainers.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.phone || 'N/A'}</td>
              <td>General Fitness</td>
              <td>
                <button class="table-action-btn" onclick="alert('Assigning Members to Trainer ${u.id}')">Assign Members</button>
                <button class="table-action-btn" onclick="alert('Editing Trainer ${u.id}')">Edit</button>
                <button class="table-action-btn" style="color:#ef4444;" onclick="alert('Removing Trainer ${u.id}')">Remove</button>
              </td>
            </tr>
          `).join('')}
          ${trainers.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No trainers found.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
