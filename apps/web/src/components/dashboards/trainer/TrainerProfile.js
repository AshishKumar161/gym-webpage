import { getCurrentUser } from '../../../utils/auth.js';

export async function renderTrainerProfile() {
  const user = getCurrentUser();
  
  return `
    <h2 class="dash-header-title">My Profile & Settings</h2>
    <p class="dash-subtitle">Update your personal details, specializations, and password.</p>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:2rem; margin-top:2rem;">
      <!-- Profile Details Form -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">👤 Professional Profile</h3>
        <form onsubmit="event.preventDefault(); alert('Profile updated successfully!');">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Full Name</label>
            <input type="text" class="form-control" value="${user?.name || ''}" required />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Email Address</label>
            <input type="email" class="form-control" value="${user?.email || ''}" disabled style="opacity:0.6; cursor:not-allowed;" />
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Specialization</label>
            <input type="text" class="form-control" value="Strength & Conditioning" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Save Changes</button>
        </form>
      </div>

      <!-- Password Update Form -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🔒 Security & Preferences</h3>
        <form onsubmit="event.preventDefault(); alert('Password changed successfully!');">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Current Password</label>
            <input type="password" class="form-control" required />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>New Password</label>
            <input type="password" class="form-control" required />
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Confirm New Password</label>
            <input type="password" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-outline" style="width:100%;">Update Password</button>
        </form>
      </div>
    </div>
  `;
}
