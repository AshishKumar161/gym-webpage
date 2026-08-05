export class BasePaymentProvider {
  constructor() {
    if (this.constructor === BasePaymentProvider) {
      throw new Error("Cannot instantiate abstract class BasePaymentProvider");
    }
  }

  /**
   * Initialize a checkout session or order
   * @param {Object} data - { amount, currency, receipt, metadata }
   * @returns {Promise<Object>} Provider-specific order/session object
   */
  async createOrder(data) {
    throw new Error("Method 'createOrder()' must be implemented.");
  }

  /**
   * Verify an incoming webhook signature
   * @param {Object} payload - The raw payload or body
   * @param {string} signature - The signature from headers
   * @returns {boolean}
   */
  verifyWebhookSignature(payload, signature) {
    throw new Error("Method 'verifyWebhookSignature()' must be implemented.");
  }

  /**
   * Issue a refund for a payment
   * @param {string} paymentId - Gateway payment ID
   * @param {number} amount - Amount to refund
   * @returns {Promise<Object>}
   */
  async issueRefund(paymentId, amount) {
    throw new Error("Method 'issueRefund()' must be implemented.");
  }
}
