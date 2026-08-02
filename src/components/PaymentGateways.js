/**
 * PaymentGateways Component — Simulated Razorpay & Stripe Checkout integration.
 */

export function triggerRazorpayCheckout(planTitle, amount) {
  alert(`⚡ Opening Razorpay Gateway...\n\nMerchant: A² ReVamp Gym\nPlan: ${planTitle}\nAmount: ₹${amount}\n\nRazorpay Checkout Ready!`);
}

export function triggerStripeCheckout(planTitle, amount) {
  alert(`💳 Opening Stripe Subscription Checkout...\n\nMerchant: A² ReVamp Gym\nPlan: ${planTitle}\nAmount: ₹${amount}\n\nStripe Secure Checkout Ready!`);
}
