import { safeFetchApi } from '../../../utils/auth.js';

export async function renderMemberDiet() {
  let diet = null;
  try {
    const data = await safeFetchApi('/diets/my-plan').catch(() => null);
    diet = data;
  } catch (err) {}

  window.__generateAIDiet = async () => {
    const btn = document.getElementById('ai-diet-btn');
    const resultDiv = document.getElementById('ai-diet-result');
    const form = document.getElementById('ai-diet-form');
    
    btn.textContent = 'Generating... (Takes ~10s)';
    btn.disabled = true;
    resultDiv.innerHTML = '<div style="color:var(--accent-cyan);">🥗 AI is analyzing optimal macros and meals...</div>';
    
    try {
      const res = await safeFetchApi('/ai/generate-diet', {
        method: 'POST',
        body: JSON.stringify({
          goal: document.getElementById('ai-diet-goal').value,
          diet: document.getElementById('ai-diet-pref').value,
          calories: document.getElementById('ai-diet-cals').value,
        })
      });
      
      const plan = res.data.dietPlan;
      
      let html = `<h4 style="margin-bottom:1rem; color:var(--green);">Generated AI Diet Plan</h4>
                  <div style="display:flex; gap:1rem; margin-bottom:1rem;">
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; flex:1; border-radius:8px; text-align:center;">
                      <div style="font-size:1.5rem; color:var(--accent-cyan); font-weight:bold;">${plan.dailyCalories || 2000}</div>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Kcal Target</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; flex:1; border-radius:8px; text-align:center;">
                      <div style="font-size:1.5rem; color:var(--green); font-weight:bold;">${plan.protein || 150}g</div>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Protein</div>
                    </div>
                  </div>`;
                  
      plan.meals.forEach(meal => {
        html += `<div style="margin-bottom:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px;">
          <h5 style="color:var(--accent-cyan); margin-bottom:0.5rem;">${meal.mealType} <span style="font-size:0.8rem; color:var(--text-secondary);">(${meal.calories} kcal)</span></h5>
          <p style="margin:0; font-size:0.9rem;">${meal.foodItems}</p>
        </div>`;
      });
      resultDiv.innerHTML = html;
      form.style.display = 'none';
      
    } catch (err) {
      resultDiv.innerHTML = `<div style="color:var(--red);">Error: ${err.message || 'Failed to generate diet.'}</div>`;
    } finally {
      btn.textContent = 'Generate New Diet';
      btn.disabled = false;
    }
  };

  const aiGeneratorHtml = `
    <div class="glass-card" style="padding:2rem; margin-top:2rem; border-left:4px solid var(--green);">
      <h3 style="margin-bottom:0.5rem; font-family:var(--font-display);">🤖 AI Nutritionist</h3>
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Let our AI Copilot build a custom macro-balanced meal plan for your specific goals.</p>
      
      <div id="ai-diet-form" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div><label>Primary Goal</label><select id="ai-diet-goal" class="form-control"><option>Fat Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
        <div><label>Dietary Preference</label><select id="ai-diet-pref" class="form-control"><option>Any</option><option>Vegetarian</option><option>Vegan</option><option>Keto</option><option>Indian Meals</option></select></div>
        <div style="grid-column: span 2;"><label>Target Calories</label><input type="number" id="ai-diet-cals" class="form-control" placeholder="2200" /></div>
        <button id="ai-diet-btn" class="btn btn-outline" style="grid-column: span 2; border-color:var(--green); color:var(--green);" onclick="window.__generateAIDiet()">Generate My Meal Plan</button>
      </div>
      
      <div id="ai-diet-result"></div>
    </div>
  `;

  if (!diet) {
    return `
      <h2 class="dash-header-title">My Diet Plan</h2>
      <div class="glass-card" style="padding:3rem; text-align:center; margin-top:2rem;">
        <div style="font-size:3rem; margin-bottom:1rem;">🥗</div>
        <h3 style="font-size:1.5rem; margin-bottom:0.5rem;">No Active Diet Plan</h3>
        <p style="color:var(--text-secondary);">You currently do not have a diet plan assigned to you.</p>
      </div>
      ${aiGeneratorHtml}
    `;
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">My Diet Plan</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Assigned by your trainer.</p>
      </div>
    </div>
    <div class="glass-card" style="padding:2rem;">
      <h3 style="margin-bottom:1.5rem; font-family:var(--font-display); color:var(--green);">Current Macros</h3>
      <p>Protein: 150g | Carbs: 200g | Fat: 65g</p>
    </div>
    ${aiGeneratorHtml}
  `;
}
