export async function renderTrainerMessaging() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Direct Messaging</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Chat with your assigned members and send announcements.</p>
      </div>
      <button class="btn btn-outline" onclick="alert('Creating Announcement...')">📢 Global Announcement</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:0; background:rgba(255,255,255,0.03); border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); min-height:500px;">
      
      <!-- Contact List -->
      <div style="border-right:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);">
        <div style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.1);">
          <input type="text" class="form-control" placeholder="Search members..." />
        </div>
        <ul style="list-style:none;">
          <li style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.05); cursor:pointer;">
            <div style="display:flex; justify-content:space-between;">
              <strong>Jane Smith</strong>
              <span style="font-size:0.8rem; color:var(--text-secondary);">10:42 AM</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem; margin-bottom:0;">Thanks for the updated diet plan!</p>
          </li>
          <li style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <div style="display:flex; justify-content:space-between;">
              <strong>Mike Johnson</strong>
              <span style="font-size:0.8rem; color:var(--text-secondary);">Yesterday</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem; margin-bottom:0;">Can we reschedule to 5 PM?</p>
          </li>
        </ul>
      </div>

      <!-- Chat Window -->
      <div style="display:flex; flex-direction:column;">
        <div style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:1rem;">
          <div style="width:40px; height:40px; border-radius:50%; background:var(--accent-cyan); display:flex; align-items:center; justify-content:center; color:#000; font-weight:700;">J</div>
          <div>
            <h4 style="margin:0;">Jane Smith</h4>
            <span style="font-size:0.8rem; color:var(--green);">Online</span>
          </div>
        </div>
        
        <div style="flex:1; padding:1.5rem; display:flex; flex-direction:column; gap:1rem; overflow-y:auto;">
          <div style="align-self:flex-start; background:rgba(255,255,255,0.1); padding:0.8rem 1.2rem; border-radius:12px; max-width:70%;">
            Hi Trainer! Just finished today's workout. It was intense!
          </div>
          <div style="align-self:flex-end; background:var(--accent-cyan); color:#000; padding:0.8rem 1.2rem; border-radius:12px; max-width:70%;">
            Awesome job Jane! Make sure to hydrate and stick to the diet tonight.
          </div>
          <div style="align-self:flex-start; background:rgba(255,255,255,0.1); padding:0.8rem 1.2rem; border-radius:12px; max-width:70%;">
            Thanks for the updated diet plan!
          </div>
        </div>

        <div style="padding:1rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; gap:0.5rem;">
          <input type="text" class="form-control" placeholder="Type your message..." style="flex:1;" />
          <button class="btn btn-primary" onclick="alert('Message Sent!')">Send</button>
        </div>
      </div>
    </div>
  `;
}
