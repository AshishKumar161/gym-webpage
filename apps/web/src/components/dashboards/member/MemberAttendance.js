import { safeFetchApi, getCurrentUser } from '../../../utils/auth.js';

export async function renderMemberAttendance(tab) {
  let logs = [];
  try {
    const data = await safeFetchApi('/attendance/my-history').catch(() => []);
    logs = Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {}

  if (tab === 'qr-checkin') {
    const user = getCurrentUser();
    return `
      <h2 class="dash-header-title">Digital QR Code Check-in</h2>
      <p class="dash-subtitle">Scan your personal pass at the gym entrance scanner for instant check-in.</p>

      <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; margin-top:2rem;">
        <div class="qr-box" style="background:#fff; padding:2rem; border-radius:12px;">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="150" height="150">
            <rect width="100" height="100" fill="white"/>
            <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="black"/>
            <path d="M20 20H30V30H20V20Z" fill="black"/>
            <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z" fill="black"/>
            <path d="M70 20H80V30H70V20Z" fill="black"/>
            <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z" fill="black"/>
            <path d="M20 70H30V80H20V70Z" fill="black"/>
            <rect x="50" y="50" width="15" height="15" fill="black"/>
            <rect x="70" y="50" width="20" height="10" fill="black"/>
            <rect x="50" y="70" width="10" height="20" fill="black"/>
            <rect x="70" y="70" width="15" height="15" fill="black"/>
          </svg>
          <div style="text-align:center; font-size:0.85rem; color:#000; font-weight:800; margin-top:0.5rem;">${user?.id ? user.id.split('-')[0].toUpperCase() : 'MEM-1234'}</div>
        </div>
        <button class="btn btn-primary" onclick="alert('Checking in member...')">⚡ Simulate Instant Scanner Check-in</button>
      </div>
    `;
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">My Attendance History</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">View your check-ins, check-outs, and streaks.</p>
      </div>
    </div>

    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Date</th><th>Check-in Time</th><th>Check-out Time</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td>${new Date(log.date).toLocaleDateString()}</td>
              <td>${log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : 'N/A'}</td>
              <td>${log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : 'N/A'}</td>
              <td><span class="badge-status badge-active">Present</span></td>
            </tr>
          `).join('')}
          ${logs.length === 0 ? `<tr><td colspan="4" style="text-align:center;">No attendance records found. Scan your QR code at the desk to check in!</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;
}
