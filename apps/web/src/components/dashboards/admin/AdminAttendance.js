import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminAttendance() {
  let attendanceLogs = [];
  try {
    // If there is an actual attendance route, fetch it. Otherwise we fallback to an empty array for now.
    const data = await safeFetchApi('/attendance/history').catch(() => []);
    attendanceLogs = Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    attendanceLogs = [];
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Attendance Dashboard</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View daily, weekly, and monthly member check-ins.</p>
      </div>
      <button class="btn btn-outline" id="btn-export-attendance" onclick="alert('Exporting Attendance...')">📥 Export Logs</button>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>User ID</th><th>Date</th><th>Check-in Time</th><th>Check-out Time</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceLogs.map(log => `
            <tr>
              <td>${log.userId}</td>
              <td>${new Date(log.date).toLocaleDateString()}</td>
              <td>${log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : 'N/A'}</td>
              <td>${log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : 'N/A'}</td>
              <td><span class="badge-status badge-active">Present</span></td>
            </tr>
          `).join('')}
          ${attendanceLogs.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No attendance records found.</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
