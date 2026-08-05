export async function renderTrainerDiets() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Diet Plan Builder</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Design meal plans and track macro compliance.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
      <!-- Builder Form -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">Create New Diet</h3>
        <form onsubmit="event.preventDefault(); alert('Diet Plan created and assigned!');">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Plan Name</label>
            <input type="text" class="form-control" placeholder="E.g., Low Carb Cut" required />
          </div>
          
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Assign to Member</label>
            <select class="form-control" required>
              <option value="">-- Select Member --</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
            <div class="form-group">
              <label>Target Calories (kcal)</label>
              <input type="number" class="form-control" placeholder="2200" required />
            </div>
            <div class="form-group">
              <label>Protein (g)</label>
              <input type="number" class="form-control" placeholder="180" required />
            </div>
          </div>

          <h4 style="margin-bottom:1rem; font-size:1rem; color:var(--green);">Meals</h4>
          <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:0.5rem;">
              <select class="form-control"><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select>
              <input type="text" class="form-control" placeholder="Meal details (e.g. 4 Eggs, 50g Oats)" required />
            </div>
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:0.5rem;">
              <select class="form-control"><option>Lunch</option><option>Dinner</option></select>
              <input type="text" class="form-control" placeholder="Meal details" />
            </div>
          </div>
          <button type="button" class="btn btn-outline" style="width:100%; margin-bottom:1.5rem;" onclick="alert('Adding meal row...')">+ Add Meal</button>

          <button type="submit" class="btn btn-primary" style="width:100%;">Save & Assign Diet</button>
        </form>
      </div>

      <!-- Recent Diets -->
      <div class="glass-card" style="padding:2rem; align-self:start;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">Active Diets</h3>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:1rem;">
          <li style="padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <strong>High Protein Build</strong>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.2rem;">Assigned to: Jane S.</div>
              </div>
              <button class="table-action-btn">Edit</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;
}
