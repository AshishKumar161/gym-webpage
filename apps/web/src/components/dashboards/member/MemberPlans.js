import { safeFetchApi } from '../../../utils/auth.js';
import { triggerRazorpayCheckout } from '../../PaymentGateways.js';

export async function renderMemberPlans() {
  let memberships = [];
  try {
    const res = await safeFetchApi('/memberships');
    memberships = res.data || [];
  } catch (err) {}

  window.triggerRazorpayCheckout = async (membershipId) => {
    const { triggerRazorpayCheckout } = await import('../../PaymentGateways.js');
    triggerRazorpayCheckout(membershipId);
  };

  return `
    <h2 class="dash-header-title">My Membership</h2>
    <p class="dash-subtitle">Manage your current subscription and view available upgrades.</p>

    <div style="margin-top:2rem;">
      <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Current Plan</h3>
      ${memberships.length > 0 ? `
        <div class="glass-card" style="padding:2rem; border-left: 4px solid var(--green);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h4 style="font-size:1.4rem; margin-bottom:0.3rem;">${memberships[0].name}</h4>
              <p style="color:var(--text-secondary); margin:0;">Active until: <strong>${new Date(new Date().setMonth(new Date().getMonth() + memberships[0].durationMonths)).toLocaleDateString()}</strong></p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline" style="color:#f97316; border-color:#f97316;" onclick="alert('Freezing membership...')">Freeze Plan</button>
              <button class="btn btn-primary" onclick="alert('Upgrading plan...')">Upgrade</button>
            </div>
          </div>
        </div>
      ` : `
        <div class="glass-card" style="padding:2rem; border-left: 4px solid #ef4444;">
          <h4 style="font-size:1.2rem; margin-bottom:0.5rem;">No Active Subscription</h4>
          <p style="color:var(--text-secondary); margin-bottom:1rem;">You currently do not have an active membership plan. Select a plan below to get started.</p>
        </div>
      `}
    </div>

    <div style="margin-top:3rem;">
      <h3 style="font-family:var(--font-display); margin-bottom:1rem;">Available Plans</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        ${memberships.map(plan => `
          <div class="glass-card" style="padding:2rem; text-align:center; ${plan.isPopular ? 'border: 2px solid var(--accent-cyan);' : ''}">
            <h4 style="font-size:1.2rem;">${plan.title}</h4>
            <div style="font-size:2rem; font-weight:800; margin:1rem 0;">₹${plan.price}</div>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1rem;">Duration: ${plan.durationMonths} months</p>
            <ul style="list-style:none; padding:0; margin-bottom:1.5rem; text-align:left; font-size:0.9rem; color:var(--text-secondary);">
              ${plan.features.map(f => `<li style="margin-bottom:0.4rem;">✅ ${f}</li>`).join('')}
            </ul>
            <button class="${plan.isPopular ? 'btn btn-primary' : 'btn btn-outline'}" style="width:100%;" onclick="window.triggerRazorpayCheckout('${plan.id}')">Select Plan</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
