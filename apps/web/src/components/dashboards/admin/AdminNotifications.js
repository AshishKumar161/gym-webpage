export async function renderAdminNotifications() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Send Notifications</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Broadcast alerts via Email, Push, or In-App.</p>
      </div>
    </div>

    <div class="glass-card" style="padding:2rem; max-width:800px; margin:0 auto;">
      <form onsubmit="event.preventDefault(); alert('Notification Sent!');">
        <div class="form-group">
          <label>Recipient Group</label>
          <select class="form-control" required>
            <option value="ALL">All Users</option>
            <option value="MEMBER">Members Only</option>
            <option value="TRAINER">Trainers Only</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-top:1.5rem;">
          <label>Notification Channels</label>
          <div style="display:flex; gap:1rem; margin-top:0.5rem;">
            <label><input type="checkbox" checked /> In-App</label>
            <label><input type="checkbox" /> Email</label>
            <label><input type="checkbox" /> Push Notification</label>
          </div>
        </div>

        <div class="form-group" style="margin-top:1.5rem;">
          <label>Title</label>
          <input type="text" class="form-control" placeholder="E.g., Holiday Schedule Update" required />
        </div>

        <div class="form-group" style="margin-top:1.5rem;">
          <label>Message Body</label>
          <textarea class="form-control" rows="5" placeholder="Enter your notification message here..." required></textarea>
        </div>

        <div style="margin-top:2rem; text-align:right;">
          <button type="submit" class="btn btn-primary" style="padding:0.75rem 2rem;">📤 Broadcast Notification</button>
        </div>
      </form>
    </div>
  `;
}
