import RazorpayProvider from './RazorpayProvider.js';
import StripeProvider from './StripeProvider.js';

class PaymentProviderFactory {
  static getProvider() {
    const providerStr = (process.env.ACTIVE_PAYMENT_GATEWAY || 'RAZORPAY').toUpperCase();
    switch (providerStr) {
      case 'RAZORPAY':
        return new RazorpayProvider();
      case 'STRIPE':
        return new StripeProvider();
      default:
        console.warn(`Payment Provider ${providerStr} not supported, falling back to RAZORPAY.`);
        return new RazorpayProvider();
    }
  }
}

export default PaymentProviderFactory;
