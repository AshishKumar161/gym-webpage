/**
 * Pricing Component — Interactive annual vs monthly billing toggle calculator.
 */
import { qs } from '../utils/dom.js';

export function initPricing() {
  const billingToggle = qs('#billing-toggle');
  if (!billingToggle) return;

  const monthlyPrices = { monthly: '999', quarterly: '2,499', yearly: '7,999' };
  const annualPrices = { monthly: '849', quarterly: '2,199', yearly: '6,999' };

  billingToggle.addEventListener('click', () => {
    const isActive = billingToggle.classList.toggle('active');
    const prices = isActive ? annualPrices : monthlyPrices;

    const monthlyEl = qs('#price-monthly');
    const quarterlyEl = qs('#price-quarterly');
    const yearlyEl = qs('#price-yearly');

    if (monthlyEl) monthlyEl.textContent = prices.monthly;
    if (quarterlyEl) quarterlyEl.textContent = prices.quarterly;
    if (yearlyEl) yearlyEl.textContent = prices.yearly;
  });
}
