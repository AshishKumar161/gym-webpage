export async function renderAdminSettings() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">System Settings</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Configure gym details, payment gateways, and security.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Settings Saved!')">💾 Save Changes</button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:2rem;">
      <!-- Gym Settings -->
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🏢 Gym Details</h3>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Gym Name</label>
          <input type="text" class="form-control" value="Gym" />
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Contact Email</label>
          <input type="email" class="form-control" value="admin@gym.com" />
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea class="form-control">123 Fitness Street</textarea>
        </div>
      </div>

      <!-- Payment Gateways -->
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">💳 Payment Integrations</h3>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Stripe Public Key</label>
          <input type="password" class="form-control" value="pk_test_123456789" />
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Razorpay Key ID</label>
          <input type="password" class="form-control" value="rzp_test_123456789" />
        </div>
      </div>
      
      <!-- Security & Backup -->
      <div class="glass-card" style="padding:1.5rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🛡️ Security & Backups</h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <button class="btn btn-outline" style="width:100%;" onclick="alert('Enforcing 2FA...')">Enforce 2FA for Staff</button>
          <button class="btn btn-outline" style="width:100%;" onclick="alert('Starting Database Backup...')">Generate Database Backup</button>
          <button class="btn btn-outline" style="width:100%; color:#ef4444; border-color:#ef4444;" onclick="alert('Clearing Cache...')">Clear System Cache</button>
        </div>
      </div>
    </div>
  `;
}
