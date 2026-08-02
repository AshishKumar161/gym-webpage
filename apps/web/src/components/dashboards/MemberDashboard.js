/**
 * Member Dashboard View Renderer with QR Code generator, BMI Calculator, and Class Booking.
 */

export function renderMemberView(tab) {
  switch (tab) {
    case 'overview':
    default:
      return `
        <h2 class="dash-header-title">Welcome back, Rahul! 👋</h2>
        <p class="dash-subtitle">Here is your daily fitness breakdown and active membership status.</p>

        <div class="dash-metrics-grid">
          <div class="metric-card glass-card">
            <div class="metric-icon">💳</div>
            <div class="metric-data">
              <strong>Quarterly</strong>
              <span style="color:var(--green)">Active until Oct 2026</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">📅</div>
            <div class="metric-data">
              <strong>18 Days</strong>
              <span>Attendance This Month</span>
            </div>
          </div>
          <div class="metric-card glass-card">
            <div class="metric-icon">🔥</div>
            <div class="metric-data">
              <strong>2,200 kcal</strong>
              <span>Daily Target</span>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
          <div class="glass-card" style="padding:2rem;">
            <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">🏋️ Today's Workout</h3>
            <p style="color:var(--accent-cyan); font-weight:700; margin-bottom:0.5rem;">Push Day — Chest & Triceps</p>
            <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
              <li>✓ Barbell Bench Press: 4 x 10</li>
              <li>✓ Incline DB Press: 3 x 12</li>
              <li>✓ Cable Flyes: 3 x 15</li>
              <li>✓ Triceps Rope Pushdown: 4 x 15</li>
            </ul>
          </div>

          <div class="glass-card" style="padding:2rem;">
            <h3 style="font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:1rem;">🥗 Today's Diet Plan</h3>
            <p style="color:var(--green); font-weight:700; margin-bottom:0.5rem;">High Protein Shred (2,200 kcal)</p>
            <ul style="list-style:none; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem;">
              <li>🍳 Breakfast: Oats + 4 Egg Whites</li>
              <li>🍗 Lunch: 200g Chicken Breast + Rice</li>
              <li>🥛 Snack: Whey Protein + Almonds</li>
              <li>🐟 Dinner: Grilled Salmon + Salad</li>
            </ul>
          </div>
        </div>
      `;

    case 'qr-checkin':
      return `
        <h2 class="dash-header-title">Digital QR Code Check-in</h2>
        <p class="dash-subtitle">Scan your personal pass at the gym entrance scanner for instant check-in.</p>

        <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; margin-top:2rem;">
          <div class="qr-box">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white"/>
              <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="black"/>
              <path d="M20 20H30V30H20V20Z" fill="black"/>
              <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z" fill="black"/>
              <path d="M70 20H80V30H70V20Z" fill="black"/>
              <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z" fill="black"/>
              <path d="M20 70H30V80H20V70Z" fill="black"/>
              <rect x="50" y="50" width="15" height="15" fill="black"/>
              <rect x="70" y="50" width="20" height="10" fill="black"/>
              <rect x="50" y="70" width="10" height="20" fill="black"/>
              <rect x="70" y="70" width="15" height="15" fill="black"/>
            </svg>
            <span style="font-size:0.75rem; color:#000; font-weight:700;">MEMBER #A2-8921</span>
          </div>
          <button class="btn btn-primary" onclick="alert('Checking in member...')">⚡ Simulate Instant QR Scanner Check-in</button>
        </div>
      `;

    case 'calculator':
      return `
        <h2 class="dash-header-title">BMI & Daily Calorie Calculator</h2>
        <p class="dash-subtitle">Calculate your Body Mass Index and daily recommended calorie intake.</p>

        <div class="glass-card calc-card" style="max-width:500px;">
          <div class="form-group">
            <label>Weight (kg)</label>
            <input type="number" id="calc-weight" class="form-control" value="75" />
          </div>
          <div class="form-group">
            <label>Height (cm)</label>
            <input type="number" id="calc-height" class="form-control" value="178" />
          </div>
          <button class="btn btn-primary" onclick="
            const w = parseFloat(document.getElementById('calc-weight').value);
            const h = parseFloat(document.getElementById('calc-height').value) / 100;
            const bmi = (w / (h * h)).toFixed(1);
            document.getElementById('bmi-res').textContent = bmi;
          ">Calculate BMI</button>

          <div class="result-gauge">
            <span>Your Body Mass Index (BMI)</span>
            <strong id="bmi-res">23.7</strong>
            <p style="color:var(--green); font-size:0.85rem; margin-top:0.3rem;">Normal Healthy Weight</p>
          </div>
        </div>
      `;

    case 'payments':
      return `
        <h2 class="dash-header-title">Invoices & Payment Receipts</h2>
        <p class="dash-subtitle">Download transaction receipts for your gym membership plans.</p>

        <div class="dash-table-wrap">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Plan Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#INV-8921</td>
                <td>Quarterly Membership</td>
                <td>₹2,499</td>
                <td>02 Aug 2026</td>
                <td><button class="table-action-btn" onclick="alert('Downloading Invoice #INV-8921 PDF...')">📥 Download PDF</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
  }
}
