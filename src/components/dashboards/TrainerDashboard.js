/**
 * Trainer Dashboard View Renderer for assigned members, workout/diet builders.
 */

export function renderTrainerView(tab) {
  switch (tab) {
    case 'overview':
    default:
      return `
        <h2 class="dash-header-title">Trainer Dashboard Overview</h2>
        <p class="dash-subtitle">Welcome back, Arjun! Manage your assigned members and client workout schedules.</p>

        <div class="dash-metrics-grid">
          <div class="metric-card glass-card">
            <div class="metric-icon">👥</div>
            <div class="metric-data">
              <strong>24</strong>
              <span>Assigned Clients</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">🏋️</div>
            <div class="metric-data">
              <strong>18</strong>
              <span>Active Workout Plans</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">🥗</div>
            <div class="metric-data">
              <strong>20</strong>
              <span>Active Diet Plans</span>
            </div>
          </div>
        </div>

        <h3 style="font-family:var(--font-display); font-size:1.2rem; font-weight:800; margin-bottom:1rem;">Your Client Roster</h3>
        <div class="dash-table-wrap">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Goal</th>
                <th>Workout Plan</th>
                <th>Diet Plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rahul Sharma</td>
                <td>Weight Loss (-18kg)</td>
                <td>Hypertrophy Split</td>
                <td>2,200 kcal High Protein</td>
                <td><button class="table-action-btn" onclick="alert('Open Plan Builder')">Assign Plan</button></td>
              </tr>
              <tr>
                <td>Priya Verma</td>
                <td>Muscle Gain (+8kg)</td>
                <td>Upper/Lower Split</td>
                <td>2,600 kcal Clean Bulk</td>
                <td><button class="table-action-btn" onclick="alert('Open Plan Builder')">Assign Plan</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

    case 'workouts':
      return `
        <h2 class="dash-header-title">Workout Plan Builder</h2>
        <p class="dash-subtitle">Create and assign customized workout routines to your clients.</p>

        <div class="glass-card" style="padding:2rem; max-width:600px; margin-bottom:2rem;">
          <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1.2rem;">Create New Routine</h3>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Select Client</label>
            <select class="form-control"><option>Rahul Sharma</option><option>Priya Verma</option></select>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Routine Title</label>
            <input type="text" class="form-control" value="Push/Pull/Legs Hypertrophy" />
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Day 1 Exercises</label>
            <textarea class="form-control" rows="3">1. Barbell Bench Press: 4 sets x 10 reps&#10;2. Incline Dumbbell Press: 3 sets x 12 reps&#10;3. Triceps Pushdowns: 4 sets x 15 reps</textarea>
          </div>
          <button class="btn btn-primary" onclick="alert('Workout Plan Saved!')">Save & Send to Client</button>
        </div>
      `;

    case 'diets':
      return `
        <h2 class="dash-header-title">Diet Plan Builder</h2>
        <p class="dash-subtitle">Design daily macro and meal schedules for client transformations.</p>

        <div class="glass-card" style="padding:2rem; max-width:600px;">
          <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1.2rem;">Create Macro Schedule</h3>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Select Client</label>
            <select class="form-control"><option>Rahul Sharma</option><option>Priya Verma</option></select>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Daily Calorie Target (kcal)</label>
            <input type="number" class="form-control" value="2200" />
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Meal Breakdown</label>
            <textarea class="form-control" rows="3">Breakfast: Oats, 4 Egg Whites, Whey Protein&#10;Lunch: Grilled Chicken Breast, Brown Rice, Broccoli&#10;Dinner: Salmon Fillet, Sweet Potato, Salad</textarea>
          </div>
          <button class="btn btn-primary" onclick="alert('Diet Plan Saved!')">Assign Diet Plan</button>
        </div>
      `;
  }
}
