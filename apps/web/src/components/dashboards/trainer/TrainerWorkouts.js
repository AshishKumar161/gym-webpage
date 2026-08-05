export async function renderTrainerWorkouts() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Workout Plan Builder</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Create, edit, and assign workout plans to members.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
      <!-- Builder Form -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">Create New Plan</h3>
        <form onsubmit="event.preventDefault(); alert('Workout Plan created and assigned!');">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Plan Name</label>
            <input type="text" class="form-control" placeholder="E.g., 4-Week Hypertrophy" required />
          </div>
          
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Assign to Member</label>
            <select class="form-control" required>
              <option value="">-- Select Member --</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
          </div>

          <h4 style="margin-bottom:1rem; font-size:1rem; color:var(--accent-cyan);">Exercises</h4>
          <div id="exercise-list" style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:0.5rem;">
              <input type="text" class="form-control" placeholder="Exercise Name" required />
              <input type="number" class="form-control" placeholder="Sets" required />
              <input type="number" class="form-control" placeholder="Reps" required />
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:0.5rem;">
              <input type="text" class="form-control" placeholder="Exercise Name" />
              <input type="number" class="form-control" placeholder="Sets" />
              <input type="number" class="form-control" placeholder="Reps" />
            </div>
          </div>
          <button type="button" class="btn btn-outline" style="width:100%; margin-bottom:1.5rem;" onclick="alert('Adding exercise row...')">+ Add Exercise</button>

          <button type="submit" class="btn btn-primary" style="width:100%;">Save & Assign Plan</button>
        </form>
      </div>

      <!-- Recent Plans -->
      <div class="glass-card" style="padding:2rem; align-self:start;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">Recent Plans</h3>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:1rem;">
          <li style="padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <strong>Beginner Full Body</strong>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.2rem;">Assigned to: Jane S.</div>
              </div>
              <button class="table-action-btn">Edit</button>
            </div>
          </li>
          <li style="padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <strong>Push/Pull/Legs</strong>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.2rem;">Assigned to: Mike J.</div>
              </div>
              <button class="table-action-btn">Edit</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;
}
