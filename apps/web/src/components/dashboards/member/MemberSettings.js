import { safeFetchApi } from '../../../utils/auth.js';

export async function renderMemberSettings() {
  let prefs = { emailEnabled: true, inAppEnabled: true, pushEnabled: false, marketingEnabled: false };
  try {
    const res = await safeFetchApi('/communication/preferences');
    if (res?.data) prefs = res.data;
  } catch (err) {}

  window.savePreferences = async () => {
    const btn = document.getElementById('save-prefs-btn');
    btn.disabled = true;
    try {
      await safeFetchApi('/communication/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          emailEnabled: document.getElementById('pref-email').checked,
          inAppEnabled: document.getElementById('pref-inapp').checked,
          pushEnabled: document.getElementById('pref-push').checked,
          marketingEnabled: document.getElementById('pref-marketing').checked
        })
      });
      alert('Preferences saved successfully!');
    } catch (err) {
      alert('Failed to save preferences');
    } finally {
      btn.disabled = false;
    }
  };

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Settings & Preferences</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Manage application settings and privacy controls.</p>
      </div>
      <button id="save-prefs-btn" class="btn btn-primary" onclick="window.savePreferences()">💾 Save Preferences</button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:2rem;">
      
      <!-- General Preferences -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🎨 Appearance & Language</h3>
        
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label>Theme Preference</label>
          <select class="form-control">
            <option value="system">System Default</option>
            <option value="dark" selected>Dark Mode (Default)</option>
            <option value="light">Light Mode</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1.5rem;">
          <label>Language</label>
          <select class="form-control">
            <option value="en" selected>English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="es">Spanish (Español)</option>
          </select>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🔔 Notifications</h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <label style="display:flex; justify-content:space-between; align-items:center;">
            <span>In-App Notifications</span>
            <input type="checkbox" id="pref-inapp" ${prefs.inAppEnabled ? 'checked' : ''} style="width:20px; height:20px;" />
          </label>
          <label style="display:flex; justify-content:space-between; align-items:center;">
            <span>Email Notifications</span>
            <input type="checkbox" id="pref-email" ${prefs.emailEnabled ? 'checked' : ''} style="width:20px; height:20px;" />
          </label>
          <label style="display:flex; justify-content:space-between; align-items:center;">
            <span>Push Notifications</span>
            <input type="checkbox" id="pref-push" ${prefs.pushEnabled ? 'checked' : ''} style="width:20px; height:20px;" />
          </label>
          <label style="display:flex; justify-content:space-between; align-items:center;">
            <span>Marketing & Promotions</span>
            <input type="checkbox" id="pref-marketing" ${prefs.marketingEnabled ? 'checked' : ''} style="width:20px; height:20px;" />
          </label>
        </div>
      </div>

      <!-- Privacy & Danger Zone -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🔒 Privacy & Account</h3>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem; font-size:0.9rem;">Manage your data privacy or request account deletion.</p>
        
        <button class="btn btn-outline" style="width:100%; margin-bottom:1rem;" onclick="alert('Downloading Data...')">📥 Download My Data</button>
        <button class="btn btn-outline" style="width:100%; color:#ef4444; border-color:#ef4444;" onclick="if(confirm('Are you sure? This cannot be undone.')) alert('Deletion request submitted.')">🗑️ Delete Account</button>
      </div>
      
    </div>
  `;
}
