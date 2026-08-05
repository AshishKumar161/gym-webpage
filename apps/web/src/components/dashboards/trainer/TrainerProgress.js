export async function renderTrainerProgress() {
  setTimeout(async () => {
    try {
      const { renderWeightChart } = await import('../Charts.js');
      renderWeightChart('client-progress-chart');
    } catch(e) {}
  }, 100);

  window.__analyzeClientProgressAI = async () => {
    const btn = document.getElementById('ai-trainer-btn');
    const resultDiv = document.getElementById('ai-trainer-result');
    
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    resultDiv.innerHTML = '<div style="color:var(--accent-cyan); font-style:italic;">🧠 AI is analyzing client logs to detect stagnation...</div>';
    
    try {
      // Simulate sending client data to the AI chat endpoint to act as a custom analyzer
      const { safeFetchApi } = await import('../../../utils/auth.js');
      const res = await safeFetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Analyze this client: Weight lost 4.2kg, Workout Compliance 85%, Diet Compliance 92%. Have they stagnated? Suggest next steps.' })
      });
      const text = res.data.text.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      resultDiv.innerHTML = `<div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:8px; font-size:0.95rem; line-height:1.6;">${text}</div>`;
    } catch (err) {
      resultDiv.innerHTML = `<div style="color:var(--red);">Error: ${err.message}</div>`;
    } finally {
      btn.textContent = 'Refresh Analysis';
      btn.disabled = false;
    }
  };

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <div>
        <h2 class="dash-header-title">Client Progress Reports</h2>
        <p class="dash-subtitle" style="margin-bottom:0;">Analyze weight loss, strength gains, and body metrics.</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <select class="form-control" style="width:200px;">
          <option>John Doe</option>
          <option>Jane Smith</option>
        </select>
        <button class="btn btn-outline" onclick="alert('Exporting Report...')">Export PDF</button>
      </div>
    </div>

    <div class="dash-metrics-grid" style="margin-bottom:2rem;">
      <div class="metric-card glass-card">
        <div class="metric-icon">📉</div>
        <div class="metric-data">
          <strong>-4.2 kg</strong>
          <span>Total Weight Lost</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-data">
          <strong>85%</strong>
          <span>Workout Compliance</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon">🥗</div>
        <div class="metric-data">
          <strong>92%</strong>
          <span>Diet Compliance</span>
        </div>
      </div>
    </div>

    <div class="glass-card" style="padding:2rem; margin-bottom:2.5rem;">
      <h3 style="margin-bottom:1.5rem; font-family:var(--font-display);">Weight Trajectory (6 Months)</h3>
      <canvas id="client-progress-chart"></canvas>
    </div>

    <!-- AI Trainer Analysis -->
    <div class="glass-card" style="padding:2rem; border-left:4px solid var(--accent-cyan);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.2rem; margin-bottom:0.2rem;">🤖 AI Progress Analyzer</h3>
          <p style="color:var(--text-secondary); margin:0;">Detect plateau periods and get data-driven adjustment recommendations.</p>
        </div>
        <button id="ai-trainer-btn" class="btn btn-primary" onclick="window.__analyzeClientProgressAI()">Analyze Client</button>
      </div>
      <div id="ai-trainer-result"></div>
    </div>
  `;
}
