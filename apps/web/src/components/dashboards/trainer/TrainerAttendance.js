import { safeFetchApi } from '../../../utils/auth.js';

export async function renderTrainerAttendance() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Class & Member Attendance</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View check-ins, approve attendance, and manual corrections.</p>
      </div>
      <button class="btn btn-outline" onclick="alert('Exporting Attendance Logs...')">📥 Export CSV</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Date</th>
            <th>Check-in Time</th>
            <th>Check-out Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Jane Smith</td>
            <td>${new Date().toLocaleDateString()}</td>
            <td>09:05 AM</td>
            <td>10:30 AM</td>
            <td><button class="table-action-btn" style="color:#f97316;" onclick="alert('Editing log...')">Edit</button></td>
          </tr>
          <tr>
            <td>Mike Johnson</td>
            <td>${new Date().toLocaleDateString()}</td>
            <td>11:00 AM</td>
            <td>--</td>
            <td><button class="table-action-btn" style="color:var(--accent-cyan);" onclick="alert('Manual check-out...')">Checkout</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
