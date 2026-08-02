/**
 * Charts Component — Renders canvas analytics graphs for revenue and attendance.
 */

export function renderRevenueChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = (canvas.width = canvas.parentElement.clientWidth || 500);
  const height = (canvas.height = 220);

  ctx.clearRect(0, 0, width, height);

  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const revenues = [320, 380, 410, 440, 460, 485]; // In Thousands (₹)
  const max = 550;

  const barWidth = width / months.length - 25;

  months.forEach((m, i) => {
    const x = i * (barWidth + 25) + 20;
    const h = (revenues[i] / max) * (height - 50);
    const y = height - h - 30;

    // Draw Bar Gradient
    const grad = ctx.createLinearGradient(x, y, x, height - 30);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(1, '#3b82f6');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, [6, 6, 0, 0]);
    ctx.fill();

    // Draw Text Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText(m, x + barWidth / 4, height - 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`₹${revenues[i]}k`, x + 2, y - 8);
  });
}

export function renderAttendanceChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = (canvas.width = canvas.parentElement.clientWidth || 500);
  const height = (canvas.height = 220);

  ctx.clearRect(0, 0, width, height);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = [120, 145, 138, 150, 142, 160];
  const max = 200;

  const stepX = (width - 40) / (days.length - 1);

  ctx.beginPath();
  days.forEach((d, i) => {
    const x = i * stepX + 20;
    const y = height - (counts[i] / max) * (height - 50) - 30;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Dots
  days.forEach((d, i) => {
    const x = i * stepX + 20;
    const y = height - (counts[i] / max) * (height - 50) - 30;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText(d, x - 10, height - 10);
  });
}
