/**
 * Shared utility functions.
 */
export function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
