/**
 * QRScanner Component — Camera scanner simulation for member check-in.
 */

export function renderQRScannerView() {
  return `
    <h2 class="dash-header-title">Front-Desk QR Scanner</h2>
    <p class="dash-subtitle">Scan member digital QR pass to log attendance automatically.</p>

    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; max-width:480px; margin:2rem auto;" class="glass-card" style="padding:2.5rem;">
      <div style="width:260px; height:260px; border:3px dashed var(--accent-cyan); border-radius:var(--r-xl); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; position:relative; overflow:hidden; background:rgba(6,182,212,0.05);">
        <div style="font-size:3.5rem; animation: pulse 1.5s infinite;">📷</div>
        <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:600;">Point Scanner at Member Screen</span>
      </div>

      <button class="btn btn-primary" style="width:100%;" onclick="
        alert('✅ QR Code Scanned! Member #A2-8921 (Rahul Sharma) checked in successfully at ' + new Date().toLocaleTimeString());
      ">⚡ Simulate Front-Desk Camera Scan</button>
    </div>
  `;
}
