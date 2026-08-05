import { safeFetchApi } from '../../../utils/auth.js';

export async function renderMemberWorkout() {
  // Try fetching existing plan
  let workout = null;
  try {
    const data = await safeFetchApi('/workouts/my-plan').catch(() => null);
    workout = data;
  } catch (err) {}

  // We embed the AI JS logic in the HTML script tag or attach it globally, 
  // but since we are rendering via string, we attach to window to handle clicks easily.
  window.__generateAIWorkout = async () => {
    const btn = document.getElementById('ai-workout-btn');
    const resultDiv = document.getElementById('ai-workout-result');
    const form = document.getElementById('ai-workout-form');
    
    btn.textContent = 'Generating... (Takes ~10s)';
    btn.disabled = true;
    resultDiv.innerHTML = '<div style="color:var(--accent-cyan);">🧠 AI is crafting your optimal workout...</div>';
    
    try {
      const res = await safeFetchApi('/ai/generate-workout', {
        method: 'POST',
        body: JSON.stringify({
          age: document.getElementById('ai-age').value,
          gender: document.getElementById('ai-gender').value,
          weight: document.getElementById('ai-weight').value,
          goal: document.getElementById('ai-goal').value,
          experience: document.getElementById('ai-exp').value,
        })
      });
      
      const plan = res.data.workoutPlan;
      
      let html = '<h4 style="margin-bottom:1rem; color:var(--green);">Generated Plan</h4>';
      plan.days.forEach(day => {
        html += `<div style="margin-bottom:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px;">
          <h5 style="color:var(--accent-cyan); margin-bottom:0.5rem;">${day.dayName}</h5>
          <ul style="list-style:none; padding-left:0;">
            ${day.exercises.map(ex => `
              <li style="display:flex; justify-content:space-between; font-size:0.9rem; padding:0.2rem 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                <span><strong>${ex.name}</strong> (${ex.muscle || 'Any'})</span>
                <span>${ex.sets} sets x ${ex.reps} reps</span>
              </li>
            `).join('')}
          </ul>
        </div>`;
      });
      resultDiv.innerHTML = html;
      form.style.display = 'none';
      
    } catch (err) {
      resultDiv.innerHTML = `<div style="color:var(--red);">Error: ${err.message || 'Failed to generate plan.'}</div>`;
    } finally {
      btn.textContent = 'Generate New Plan';
      btn.disabled = false;
    }
  };

  const aiGeneratorHtml = `
    <div class="glass-card" style="padding:2rem; margin-top:2rem; border-left:4px solid var(--accent-cyan);">
      <h3 style="margin-bottom:0.5rem; font-family:var(--font-display);">🤖 AI Workout Generator</h3>
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Let our AI Copilot design a highly personalized workout plan for you.</p>
      
      <div id="ai-workout-form" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div><label>Age</label><input type="number" id="ai-age" class="form-control" placeholder="25" /></div>
        <div><label>Gender</label><select id="ai-gender" class="form-control"><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div><label>Weight (kg)</label><input type="number" id="ai-weight" class="form-control" placeholder="75" /></div>
        <div><label>Goal</label><select id="ai-goal" class="form-control"><option>Muscle Gain</option><option>Weight Loss</option><option>Endurance</option></select></div>
        <div style="grid-column: span 2;"><label>Experience</label><select id="ai-exp" class="form-control"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        <button id="ai-workout-btn" class="btn btn-outline" style="grid-column: span 2; border-color:var(--accent-cyan); color:var(--accent-cyan);" onclick="window.__generateAIWorkout()">Generate My Plan</button>
      </div>
      
      <div id="ai-workout-result"></div>
    </div>
  `;

  if (!workout) {
    return `
      <h2 class="dash-header-title">My Workout Plan</h2>
      <div class="glass-card" style="padding:3rem; text-align:center; margin-top:2rem;">
        <div style="font-size:3rem; margin-bottom:1rem;">🏋️‍♂️</div>
        <h3 style="font-size:1.5rem; margin-bottom:0.5rem;">No Active Workout Plan</h3>
        <p style="color:var(--text-secondary);">You currently do not have a workout plan assigned to you.</p>
      </div>
      ${aiGeneratorHtml}
    `;
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">My Workout Plan</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Assigned by your trainer.</p>
      </div>
    </div>
    <div class="glass-card" style="padding:2rem;">
      <h3 style="margin-bottom:1.5rem; font-family:var(--font-display); color:var(--accent-cyan);">Current Split</h3>
      <ul style="list-style:none; display:flex; flex-direction:column; gap:1rem;">
        <li style="display:flex; justify-content:space-between; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1);">
          <div><strong>Barbell Bench Press</strong></div>
          <div style="text-align:right;"><strong>4 Sets x 10 Reps</strong></div>
        </li>
      </ul>
    </div>
    ${aiGeneratorHtml}
  `;
}
