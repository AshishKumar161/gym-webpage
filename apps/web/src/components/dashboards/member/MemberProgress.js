export async function renderMemberProgress() {
  setTimeout(async () => {
    try {
      const { renderWeightChart } = await import('../Charts.js');
      renderWeightChart('weight-chart');
    } catch(e) {}
  }, 100);

  return `
    <h2 class="dash-header-title">Progress & Body Metrics</h2>
    <p class="dash-subtitle">Track your weight, body fat percentage, and calculate your BMI.</p>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:2rem; margin-top:2rem;">
      
      <!-- BMI Calculator -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">🧮 BMI Calculator</h3>
        <form onsubmit="event.preventDefault(); 
          const w = parseFloat(document.getElementById('calc-weight').value);
          const h = parseFloat(document.getElementById('calc-height').value) / 100;
          const bmi = (w / (h * h)).toFixed(1);
          document.getElementById('bmi-res').textContent = bmi;
        ">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Weight (kg)</label>
            <input type="number" id="calc-weight" class="form-control" value="75" required />
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Height (cm)</label>
            <input type="number" id="calc-height" class="form-control" value="178" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Calculate BMI</button>
        </form>

        <div class="result-gauge" style="margin-top:2rem; text-align:center; padding:1.5rem; background:rgba(0,0,0,0.2); border-radius:12px;">
          <span style="color:var(--text-secondary); font-size:0.9rem;">Your Body Mass Index</span>
          <strong id="bmi-res" style="display:block; font-size:2.5rem; font-weight:900; margin:0.5rem 0; color:var(--accent-cyan);">23.7</strong>
          <p style="color:var(--green); font-size:0.85rem; margin:0;">Normal Healthy Weight</p>
        </div>
      </div>

      <!-- Weight Graph -->
      <div class="glass-card" style="padding:2rem;">
        <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">📉 Weight Tracking (Last 6 Months)</h3>
        <canvas id="weight-chart"></canvas>
        <button class="btn btn-outline" style="width:100%; margin-top:1.5rem;" onclick="alert('Opening Log Weight Modal')">+ Log New Weight</button>
      </div>

    </div>
  `;
}
