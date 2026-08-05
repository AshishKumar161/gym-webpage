import { safeFetchApi } from '../utils/auth.js';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function triggerRazorpayCheckout(membershipId, couponCode = null) {
  try {
    // 1. Create order on backend
    const res = await safeFetchApi('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ membershipId, couponCode })
    });
    
    const { order, paymentId } = res.data;

    // 2. Mock mode fallback
    if (order.id.startsWith('order_mock_')) {
      alert(`Mock Payment Mode: Order ${order.id} created for ${order.amount / 100} ${order.currency}. Completing automatically.`);
      await safeFetchApi('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          paymentId,
          gatewayPaymentId: 'mock_txn_' + Date.now(),
          membershipId
        })
      });
      alert("Payment successful! Membership updated.");
      window.location.reload();
      return;
    }

    // 3. Load Razorpay UI
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Please check your connection.");
      return;
    }

    const options = {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy', // We would fetch this via config normally, or pass it from checkout
      amount: order.amount,
      currency: order.currency,
      name: 'A² ReVamp Gym',
      description: 'Membership Purchase',
      order_id: order.id,
      handler: async function (response) {
        try {
          // 4. Verify on backend
          await safeFetchApi('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              paymentId,
              gatewayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              payload: order.id + "|" + response.razorpay_payment_id,
              membershipId
            })
          });
          alert("Payment successful! Membership updated.");
          window.location.reload();
        } catch (verifyErr) {
          alert("Payment verification failed.");
        }
      },
      theme: {
        color: '#0ea5e9' // accent-cyan
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
    });
    rzp.open();
  } catch (err) {
    alert(`Checkout error: ${err.message}`);
  }
}

export function triggerStripeCheckout(planTitle, amount) {
  alert(`💳 Stripe checkout is ready to be connected to /create-checkout-session.`);
}
